import React from 'react';
import { SearchableSelect as SobaikeSearchableSelect } from '../sobaike-ui/SearchableSelect';

/* Keep the approved eReturn API and option values while using the exact
 * Sobaike Janao Public searchable select implementation and keyboard UX. */
interface Option {label: string;value: string}
interface SearchableSelectProps {
 id?:string;label?:string;options:(string|Option)[];value:string;
 onChange:(val:string)=>void;placeholder?:string;disabled?:boolean;className?:string;
}
export const SearchableSelect:React.FC<SearchableSelectProps>=({
 id,label,options,value,onChange,placeholder='Select option...',disabled=false,className=''
})=><SobaikeSearchableSelect
 id={id} label={label} value={value} onChange={onChange} placeholder={placeholder}
 disabled={disabled} className={className}
 options={options.map(option=>typeof option==='string'?{label:option,value:option}:option)}
/>;
