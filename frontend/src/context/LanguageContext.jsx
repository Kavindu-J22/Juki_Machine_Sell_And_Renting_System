import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    systemTitle: 'ANUJAYA & GLOBAL ENTERPRISES',
    systemTagline: 'Industrial Apparel Machinery & Logistics Consortium',
    adminPortal: 'Consortium Admin Portal',
    partnerPortal: 'Partner Equity Portal',
    clientPortal: 'Apparel Client Portal',
    dashboard: 'Dashboard',
    machineryMaster: 'Machinery Master',
    posDispatch: 'POS Sales Dispatch',
    partnerEquity: 'Consortium Reconciliation',
    clientCRM: 'Apparel Clients CRM',
    myEquipment: 'My Equipment & Warranties',
    serviceRequests: 'Service Requests',
    settings: 'Global Settings',
    reports: 'Audit Reports',
    logout: 'Sign Out',
    welcomeBack: 'Welcome back',
    liveRate: 'Live Exchange Rate Anchor',
    fobUsd: 'Factory FOB Cost (USD)',
    customsDuty: 'Customs Duty & Surcharges (LKR)',
    landedCost: 'Calculated Landed Cost (LKR)',
    wholesaleBenchmark: 'Wholesale Benchmark',
    retailBenchmark: 'Retail Benchmark',
    initialBatchSets: 'Initial Batch Sets',
    availableSets: 'Available Stock Sets',
    dispatchedSets: 'Dispatched Sets',
    serialsTracked: 'Serials Tracked',
    paymentStatus: 'Payment Status',
    paid: 'Fully Paid',
    partial: 'Partial Collection',
    pending: 'Credit / Pending',
    amountPaid: 'Amount Collected',
    outstandingBalance: 'Outstanding Balance',
    anujayaEquity: 'Anujaya Enterprises Equity',
    globalEquity: 'Global Enterprises Equity',
    realizedNet: 'Realized Net Earnings',
    capitalDraws: 'Capital Draws / Disbursements',
    unsettledCredit: 'Unsettled Credit Balance',
    printableInvoice: 'Commercial Tax Invoice',
    print: 'Print A4 Invoice',
    exportCsv: 'Export CSV',
    importCsv: 'Import CSV',
    backup: 'Backup System JSON',
    restore: 'Restore Backup',
    dbConnected: 'DB Connected',
    dbSyncing: 'Syncing Data...',
    dbOffline: 'DB Offline',
    addMachine: 'Register Equipment SKU',
    createDispatch: 'Create POS Dispatch',
    logDraw: 'Log Capital Draw',
    fileRequest: 'File Service Ticket',
    searchPlaceholder: 'Search SKUs, Models, Serials, Clients...',
    currency: 'LKR'
  },
  si: {
    systemTitle: 'අනූජය සහ ග්ලෝබල් එන්ටර්ප්‍රයිසස්',
    systemTagline: 'කාර්මික ඇඟලුම් යන්ත්‍රෝපකරණ සහ ලොජිස්ටික්ස් සන්ධානය',
    adminPortal: 'සන්ධාන පරිපාලන පද්ධතිය',
    partnerPortal: 'කොටස්කාර පද්ධතිය',
    clientPortal: 'ඇඟලුම් පාරිභෝගික පද්ධතිය',
    dashboard: 'ප්‍රධාන පුවරුව',
    machineryMaster: 'යන්ත්‍රෝපකරණ තොග කළමනාකරණය',
    posDispatch: 'විකුණුම් සහ නිකුත් කිරීම් (POS)',
    partnerEquity: 'කොටස් සහ මුදල් පියවීම්',
    clientCRM: 'ඇඟලුම් පාරිභෝගික ලේඛනය',
    myEquipment: 'මගේ යන්ත්‍ර සහ වගකීම්',
    serviceRequests: 'සේවා සහ නඩත්තු ඉල්ලීම්',
    settings: 'ගෝලීය සැකසුම්',
    reports: 'ගණන් පරීක්ෂණ වාර්තා',
    logout: 'පද්ධතියෙන් ඉවත් වන්න',
    welcomeBack: 'සාදරයෙන් පිළිගනිමු',
    liveRate: 'එක්සත් ජනපද ඩොලර් විනිමය අනුපාතිකය',
    fobUsd: 'කර්මාන්තශාලා FOB පිරිවැය (USD)',
    customsDuty: 'රේගු බදු සහ ගාස්තු (LKR)',
    landedCost: 'ගණනය කළ මුළු පිරිවැය (LKR)',
    wholesaleBenchmark: 'තොග මිල පදනම',
    retailBenchmark: 'සිල්ලර මිල පදනම',
    initialBatchSets: 'ආරම්භක කණ්ඩායම් ප්‍රමාණය',
    availableSets: 'පවතින තොග ප්‍රමාණය',
    dispatchedSets: 'නිකුත් කළ ප්‍රමාණය',
    serialsTracked: 'අනුක්‍රමික අංක (Serials)',
    paymentStatus: 'ගෙවීම් තත්ත්වය',
    paid: 'සම්පූර්ණයෙන් ගෙවා ඇත',
    partial: 'කොටසක් ගෙවා ඇත',
    pending: 'ණය / හිඟ ගෙවීම්',
    amountPaid: 'ලබාගත් මුදල',
    outstandingBalance: 'අයවිය යුතු ශේෂය',
    anujayaEquity: 'අනූජය එන්ටර්ප්‍රයිසස් හිමිකම',
    globalEquity: 'ග්ලෝබල් එන්ටර්ප්‍රයිසස් හිමිකම',
    realizedNet: 'ලබාගත් ශුද්ධ ලාභය',
    capitalDraws: 'ප්‍රාග්ධන ඉවත් කරගැනීම්',
    unsettledCredit: 'නොපියවූ ණය ශේෂය',
    printableInvoice: 'වාණිජ බදු ඉන්වොයිසිය',
    print: 'ඉන්වොයිසිය මුද්‍රණය කරන්න',
    exportCsv: 'CSV ගොනුවක් ලෙස ලබාගන්න',
    importCsv: 'CSV ගොනුවකින් තොග ඇතුළත් කරන්න',
    backup: 'දත්ත පද්ධතිය සුරකින්න (Backup)',
    restore: 'දත්ත පද්ධතිය ප්‍රත්‍යර්පණය කරන්න',
    dbConnected: 'දත්ත පද්ධතිය සම්බන්ධයි',
    dbSyncing: 'දත්ත සමමුහුර්ත වෙමින්...',
    dbOffline: 'දත්ත පද්ධතිය විසන්ධි වී ඇත',
    addMachine: 'නව යන්ත්‍රයක් ඇතුළත් කරන්න',
    createDispatch: 'නව විකුණුම් නිකුතුවක්',
    logDraw: 'ප්‍රාග්ධන ඉවත් කරගැනීමක් සටහන් කරන්න',
    fileRequest: 'සේවා ඉල්ලීමක් ඇතුළත් කරන්න',
    searchPlaceholder: 'SKU, මොඩලය, Serial අංකය හෝ පාරිභෝගිකයා සොයන්න...',
    currency: 'රු.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('erp_language') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'si' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('erp_language', nextLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
