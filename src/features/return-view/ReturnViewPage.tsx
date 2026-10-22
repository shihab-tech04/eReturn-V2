import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatBDT, toBanglaDigits } from '../../i18n/formatters';
import { aggregateIncomeHeads } from '../../adapters/calculationAdapter';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { Printer, Download, ArrowRight, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export const ReturnViewPage: React.FC = () => {
  const { language, t, profile, assessment, income, rebate, expenditure, assetsLiabilities, taxPayment } = useApp();
  const navigate = useNavigate();

  const incAgg = aggregateIncomeHeads(income);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Toolbar (Hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('returnViewTitle')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{t('returnViewSubtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center flex-1 sm:flex-none min-w-0 gap-1.5 px-3.5 py-2 border border-gray-300 rounded-md shadow-xs text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            {t('print')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/user-panel/submission')}
            className="inline-flex items-center justify-center flex-1 sm:flex-none min-w-0 gap-1.5 px-4 py-2 border border-transparent rounded-md shadow-xs text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
          >
            <span>{language === 'bn' ? 'চূড়ান্ত দাখিলে অগ্রসর হোন' : 'Proceed to Submission'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable IT-11GA Form Sheet */}
      <div className="min-w-0 w-full bg-white p-4 sm:p-12 rounded-xl border border-gray-300 shadow-md print:shadow-none print:border-none print:p-0 space-y-6 font-sans text-xs text-gray-900 leading-normal">
        {/* Government of Bangladesh Seal & Form Header */}
        <div className="text-center space-y-1 border-b-2 border-gray-900 pb-4">
          <div className="w-12 h-12 rounded-full bg-red-600 border-2 border-emerald-800 mx-auto flex items-center justify-center text-white font-bold text-xs mb-1">
            NBR
          </div>
          <h1 className="text-base font-extrabold uppercase tracking-wide">
            {t('it11gaHeader')}
          </h1>
          <h2 className="text-sm font-bold text-emerald-900">{t('it11gaForm')}</h2>
          <p className="text-xs font-medium tracking-wide">{t('it11gaSub')}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-mono pt-1 text-gray-700">
            <span>Assessment Year: <strong className="text-gray-900">{assessment.assessmentYear}</strong></span>
            <span>Return Scheme: <strong className="text-gray-900">{assessment.returnScheme}</strong></span>
            <span>Resident Status: <strong className="text-gray-900">{assessment.residentStatus}</strong></span>
          </div>
        </div>

        {/* PART I: Personal & Assessment Information */}
        <div className="space-y-3">
          <div className="bg-gray-100 font-bold px-3 py-1 text-xs border border-gray-300 uppercase">
            {t('part1')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 px-1 text-xs">
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">01. Taxpayer's Name:</span>
              <span className="font-bold">{profile.name} ({profile.nameBn})</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">02. TIN (12-Digit):</span>
              <span className="font-mono font-bold text-emerald-900">{profile.tin}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">03. National ID (NID):</span>
              <span className="font-mono">{profile.nid}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">04. Date of Birth / Gender:</span>
              <span>{profile.dob} ({profile.gender})</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">05. Father's Name:</span>
              <span>{profile.fatherName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">06. Mother's Name:</span>
              <span>{profile.motherName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">07. Spouse Name & TIN:</span>
              <span>{profile.spouseName} ({profile.spouseTin || 'No TIN'})</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">08. Taxes Circle & Zone:</span>
              <span className="font-medium">{profile.taxesCircle}, {profile.taxesZone}</span>
            </div>
            <div className="sm:col-span-2 flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-600 font-medium">09. Present Address:</span>
              <span>{profile.currentAddress}</span>
            </div>
          </div>
        </div>

        {/* PART II: Particulars of Income */}
        <div className="space-y-3">
          <div className="bg-gray-100 font-bold px-3 py-1 text-xs border border-gray-300 uppercase">
            {t('part2')}
          </div>

          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-300">
                <th className="border border-gray-300 px-3 py-2 text-left w-12">SL</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Heads of Income</th>
                <th className="border border-gray-300 px-3 py-2 text-right w-44">Entered Amount (BDT) — tax verification pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">10</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headEmployment')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {language === 'bn' ? 'যাচাই বাকি' : 'Pending verified rules'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">11</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headRent')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {language === 'bn' ? 'যাচাই বাকি' : 'Pending verified rules'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">12</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headAgriculture')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {language === 'bn' ? 'যাচাই বাকি' : 'Pending verified rules'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">13</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headBusiness')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(incAgg.bizNet, language)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">14</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headCapitalGain')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(incAgg.capGainNet, language)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">15</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headFinancialAssets')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(incAgg.financialNet, language)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">16</td>
                <td className="border border-gray-300 px-3 py-1.5">{t('headOtherSources')}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(incAgg.otherNet, language)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">17</td>
                <td className="border border-gray-300 px-3 py-1.5">Share of Income from Firm / AoP / Foreign / Spouse</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(incAgg.firmNet + incAgg.aopNet + incAgg.foreignNet + incAgg.spouseMinorNet, language)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-2 font-mono text-center">18</td>
                <td className="border border-gray-300 px-3 py-2 uppercase">TOTAL TAXABLE INCOME (Items 10 to 17)</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-mono text-emerald-950">
                  {language === 'bn' ? 'করযোগ্য আয় যাচাই বাকি' : 'Pending verified taxable-income calculation'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PART III: Tax Computation and Payment Particulars */}
        <div className="space-y-3">
          <div className="bg-gray-100 font-bold px-3 py-1 text-xs border border-gray-300 uppercase">
            {t('part3')}
          </div>

          <table className="w-full border-collapse border border-gray-300 text-xs">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center w-12">19</td>
                <td className="border border-gray-300 px-3 py-1.5">Gross Tax on Total Taxable Income</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium w-44">
                  {(language === 'bn' ? 'রুলস ইঞ্জিন অনুমোদন বাকি' : 'Not calculated — Rules Engine pending')}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">20</td>
                <td className="border border-gray-300 px-3 py-1.5">Tax Rebate on Eligible Investment (Schedule 24D)</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium text-emerald-700">
                  - {(language === 'bn' ? 'রুলস ইঞ্জিন অনুমোদন বাকি' : 'Not calculated — Rules Engine pending')}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">21</td>
                <td className="border border-gray-300 px-3 py-1.5">Net Tax Liability (or Minimum Tax applied)</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-bold">
                  {(language === 'bn' ? 'রুলস ইঞ্জিন অনুমোদন বাকি' : 'Not calculated — Rules Engine pending')}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">22</td>
                <td className="border border-gray-300 px-3 py-1.5">Entered Tax Deducted / Collected at Source (not verified credit)</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(taxPayment.totalTDS, language)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">23</td>
                <td className="border border-gray-300 px-3 py-1.5">Advance Tax Entered (payment unverified)</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(taxPayment.advanceTaxPaid, language)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5 font-mono text-center">24</td>
                <td className="border border-gray-300 px-3 py-1.5">
                  Tax Payment Entered (unverified challan: {taxPayment.challanNumber || 'N/A'}, Date: {taxPayment.challanDate || 'N/A'})
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono font-medium">
                  {formatBDT(taxPayment.taxPaidWithReturn, language)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-2 font-mono text-center">25</td>
                <td className="border border-gray-300 px-3 py-2 uppercase">
                  {language === 'bn' ? 'পরিশোধযোগ্য / ফেরতযোগ্য — যাচাই বাকি' : 'TAX PAYABLE / REFUND — NOT CALCULATED'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-mono text-sm text-emerald-950">
                  {(language === 'bn' ? 'রুলস ইঞ্জিন অনুমোদন বাকি' : 'Not calculated — Rules Engine pending')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-amber-900 border border-amber-200 bg-amber-50 rounded-md p-3" role="status">
          {language === 'bn' ? 'এখানে কর, রেয়াত ও নিষ্পত্তির অঙ্ক প্রদর্শিত হয়নি কারণ নিয়ন্ত্রিত রুলস ইঞ্জিন এখনো অনুমোদিত নয়।'
           : 'Statutory tax, rebate and settlement values are deliberately unavailable until an approved versioned Rules Engine result is connected. Entered withholding is not a verified tax credit.'}
        </p>
        {/* PART IV: Declaration and Verification */}
        <div className="space-y-4 pt-2">
          <div className="bg-gray-100 font-bold px-3 py-1 text-xs border border-gray-300 uppercase">
            {t('part4')}
          </div>

          <p className="italic text-gray-700 leading-relaxed px-1">
            "{t('declarationStatement')}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-8 px-1">
            <div className="space-y-1">
              <div className="border-b border-gray-400 max-w-full w-48 mb-1"></div>
              <div className="font-semibold">Place: Dhaka, Bangladesh</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>

            <div className="space-y-1 text-right">
              <div className="border-b border-gray-400 max-w-full w-48 ml-auto mb-1"></div>
              <div className="font-bold">{profile.name}</div>
              <div className="text-gray-600">Signature of Taxpayer</div>
            </div>
          </div>
        </div>

        {/* Traceability Footer */}
        <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-400 flex flex-wrap items-center justify-between gap-2 font-mono break-all">
          <span>Generated by NBR eReturn Public Engine • Mode: Synthetic Local Session</span>
          <span>Security Token: NBR-IT11GA-{profile.tin}-{assessment.assessmentYear}</span>
        </div>
      </div>

      <div className="print:hidden">
        <StepNavigationButtons
          backPath="/user-panel/tax-payment"
          nextPath="/user-panel/submission"
          nextLabel={language === 'bn' ? 'চূড়ান্ত দাখিলে অগ্রসর হোন' : 'Proceed to Final Submission'}
        />
      </div>
    </div>
  );
};
