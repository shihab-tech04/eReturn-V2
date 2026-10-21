/**
 * Client-only PDF digital-text extraction with PDF.js.
 * Never uploads the document or sends it to an AI/OCR service.
 * Scanned pages are marked as requiring an approved separate OCR review.
 */
import * as pdfjs from 'pdfjs-dist';
import { CorporateReportDraft, SourcePage, proposeCorporateLines } from './corporateIntake';

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

function hex(bytes:ArrayBuffer):string{
  return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
type PdfText = {str?:string; transform?:number[]; width?:number};
function pageText(items:PdfText[]):string{
  const entries=items.filter(t=>typeof t.str==='string'&&t.str.trim()&&t.transform?.length===6)
    .map(t=>({x:t.transform![4],y:t.transform![5],text:t.str!.trim()}))
    .sort((a,b)=>b.y-a.y||a.x-b.x);
  const rows:{y:number;items:typeof entries}[]=[];
  entries.forEach(e=>{
    const found=rows.find(r=>Math.abs(r.y-e.y)<2.0);
    if(found)found.items.push(e);else rows.push({y:e.y,items:[e]});
  });
  return rows.sort((a,b)=>b.y-a.y)
    .map(r=>r.items.sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ')).join('\n');
}
export async function extractCorporatePdf(file:File):Promise<CorporateReportDraft>{
  if(!file.name.toLowerCase().endsWith('.pdf')||file.size===0||file.size>75*1024*1024)
    throw Error('PDF_ONLY_MAX_75MB');
  const bytes=await file.arrayBuffer();
  const signature=new TextDecoder().decode(bytes.slice(0,8));
  if(!signature.startsWith('%PDF-'))throw Error('INVALID_PDF_SIGNATURE');
  const sha256=hex(await crypto.subtle.digest('SHA-256',bytes.slice(0)));
  const task=pdfjs.getDocument({data:new Uint8Array(bytes),useSystemFonts:true});
  const pdf=await task.promise;
  const pages:SourcePage[]=[];
  let digitalPages=0,scanPages=0;
  try{
    if(pdf.numPages>1000)throw Error('PDF_PAGE_LIMIT_1000');
    for(let i=1;i<=pdf.numPages;i++){
      const p=await pdf.getPage(i);
      const content=await p.getTextContent();
      const txt=pageText(content.items as PdfText[]);
      if(txt.replace(/\s/g,'').length>=50)digitalPages++;else scanPages++;
      pages.push({page:i,text:txt,textItems:content.items.length});
      p.cleanup();
    }
  }finally{await task.destroy();}
  return{
    schema:'WS06_CORPORATE_INTAKE_V1',
    source:{name:file.name,sha256,bytes:file.size,pageCount:pages.length,digitalPages,scanPages,parser:'PDFJS_TEXT_V1'},
    context:{companyName:'',financialPeriodEnd:'',comparativePeriodEnd:'',currency:'UNCONFIRMED',scale:'UNCONFIRMED'},
    lines:proposeCorporateLines(pages),
    stage:'REVIEW_ONLY'
  };
}
