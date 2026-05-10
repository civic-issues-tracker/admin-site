import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
    <button 
      onClick={toggleLanguage}
      className="px-3 py-1 border cursor-pointer border-secondary/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-primary transition-all"
    >
      {i18n.language === 'en' ? 'አማ' : 'Eng'}
    </button>

     {/* <button 
        onClick={() => i18n.changeLanguage('en')} 
        className="..."
        >
        Eng
        </button>

        <button 
        onClick={() => i18n.changeLanguage('am')} 
        className="..."
        >
        አማ
     </button> */}
    </>
  );
};

export default LanguageSwitcher;