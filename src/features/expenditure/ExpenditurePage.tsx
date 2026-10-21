import React from 'react';
import { useApp } from '../../context/AppContext';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { AccessibleHelpTooltip } from '../../components/common/AccessibleHelpTooltip';
import { formatBDT } from '../../i18n/formatters';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

export const ExpenditurePage: React.FC = () => {
  const { language, t, expenditure, setExpenditure } = useApp();

  const handleUpdate = (field: keyof typeof expenditure, val: number) => {
    setExpenditure((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const total =
    (expenditure.personalAndFood || 0) +
    (expenditure.housingRentAndMaintenance || 0) +
    (expenditure.autoAndTransport || 0) +
    (expenditure.utilityBills || 0) +
    (expenditure.educationExpenses || 0) +
    (expenditure.eventsAndHospitality || 0) +
    (expenditure.foreignTravel || 0) +
    (expenditure.donationsAndGiftsNonRebate || 0) +
    (expenditure.otherLivingExpenses || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('expenditureTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('expenditureSubtitle')}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-right">
          <span className="text-[11px] text-emerald-800 font-medium block">
            {language === 'bn' ? 'মোট বার্ষিক ব্যয়:' : 'Total Annual Expenditure:'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-900">
            {formatBDT(total, language)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs divide-y divide-gray-100">
        {/* 1. Personal & Food */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                1. {t('personalFood')}
              </span>
              <AccessibleHelpTooltip content="Monthly groceries, food, clothing, kitchen and daily family sustenance expenses." />
            </div>
            <p className="text-[11px] text-gray-500">Groceries, household provisions, dining, clothing & healthcare</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.personalAndFood}
              onChange={(v) => handleUpdate('personalAndFood', v)}
            />
          </div>
        </div>

        {/* 2. Housing & Accommodation */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                2. {t('housingRent')}
              </span>
              <AccessibleHelpTooltip content="Annual rent paid for residential dwelling, building service charge and upkeep." />
            </div>
            <p className="text-[11px] text-gray-500">Rent paid for residence, building society charge, security and repairs</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.housingRentAndMaintenance}
              onChange={(v) => handleUpdate('housingRentAndMaintenance', v)}
            />
          </div>
        </div>

        {/* 3. Auto & Transportation */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                3. {t('autoTransport')}
              </span>
              <AccessibleHelpTooltip content="Fuel, driver salary, CNG/petrol, vehicle tax token, insurance and rideshare/public transit." />
            </div>
            <p className="text-[11px] text-gray-500">Motor vehicle fuel, driver compensation, maintenance & commute fares</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.autoAndTransport}
              onChange={(v) => handleUpdate('autoAndTransport', v)}
            />
          </div>
        </div>

        {/* 4. Utility Bills */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                4. {t('utilities')}
              </span>
              <AccessibleHelpTooltip content="DESCO/DPDC electricity bills, WASA water, Titas Gas and mobile/broadband internet charges." />
            </div>
            <p className="text-[11px] text-gray-500">Electricity (DESCO/DPDC), gas, water, mobile airtime and home broadband</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.utilityBills}
              onChange={(v) => handleUpdate('utilityBills', v)}
            />
          </div>
        </div>

        {/* 5. Education Expenses */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                5. {t('education')}
              </span>
              <AccessibleHelpTooltip content="School and college tuition, coaching, textbooks and university fees for dependents." />
            </div>
            <p className="text-[11px] text-gray-500">School/college tuition, stationery, books, and coaching for children</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.educationExpenses}
              onChange={(v) => handleUpdate('educationExpenses', v)}
            />
          </div>
        </div>

        {/* 6. Festivals, Parties & Hospitality */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                6. {t('festivals')}
              </span>
              <AccessibleHelpTooltip content="Eid, Puja, family ceremonies, weddings, birthdays and social entertainment expenses." />
            </div>
            <p className="text-[11px] text-gray-500">Eid, Puja celebrations, family weddings, birthdays and social entertainment</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.eventsAndHospitality}
              onChange={(v) => handleUpdate('eventsAndHospitality', v)}
            />
          </div>
        </div>

        {/* 7. Foreign Travel & Vacation */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                7. {t('foreignTravel')}
              </span>
              <AccessibleHelpTooltip content="Airfare, hotel accommodation, foreign currency endorsement and overseas holiday costs." />
            </div>
            <p className="text-[11px] text-gray-500">Personal overseas holidays, air travel, hotels and travel allowances</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.foreignTravel}
              onChange={(v) => handleUpdate('foreignTravel', v)}
            />
          </div>
        </div>

        {/* 8. Donations & Gifts (Non-Rebate) */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                8. {t('donationsGifts')}
              </span>
              <AccessibleHelpTooltip content="Gifts to relatives, personal charity and informal donations not qualifying under Schedule 24D." />
            </div>
            <p className="text-[11px] text-gray-500">Personal gifts to relatives and informal charity (distinct from 24D rebate)</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.donationsAndGiftsNonRebate}
              onChange={(v) => handleUpdate('donationsAndGiftsNonRebate', v)}
            />
          </div>
        </div>

        {/* 9. Other Household & Living */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-gray-900">
                9. {t('otherLiving')}
              </span>
              <AccessibleHelpTooltip content="Domestic help salaries, electronics repairs, pet care, subscriptions and miscellaneous expenses." />
            </div>
            <p className="text-[11px] text-gray-500">Domestic helper wages, appliance repairs, memberships and incidental costs</p>
          </div>
          <div className="w-full sm:w-56">
            <AmountInput
              value={expenditure.otherLivingExpenses}
              onChange={(v) => handleUpdate('otherLivingExpenses', v)}
            />
          </div>
        </div>
      </div>

      {/* Total Box */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider block">
            {t('totalLifestyleExpenditure')}
          </span>
          <span className="text-xs text-emerald-300">
            {language === 'bn' ? 'পরিসম্পদ ও দায় বিবরণীতে তহবিল ব্যবহারের সাথে স্বয়ংক্রিয়ভাবে সমন্বয় হইবে' : 'Carried forward to IT-10B Statement of Assets & Liabilities'}
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {formatBDT(total, language)}
        </div>
      </div>

      <StepNavigationButtons
        backPath="/user-panel/rebate"
        nextPath="/user-panel/assets-liabilities"
      />
    </div>
  );
};
