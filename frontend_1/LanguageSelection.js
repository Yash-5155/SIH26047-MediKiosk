(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('react'));
  } else {
    root.LanguageSelection = factory(root.React);
  }
}(typeof self !== 'undefined' ? self : this, function (React) {
  if (!React) {
    console.error('[LanguageSelection] React is required but not loaded!');
    return null;
  }

  const { useState, useEffect, createElement: h } = React;

  const LANGUAGES = [
    {
      id: 'en',
      countryCode: 'GB',
      name: 'English',
      sub: '(English)',
      hint: 'Select English to proceed',
      available: true
    },
    {
      id: 'hi',
      countryCode: 'IN',
      name: 'हिन्दी',
      sub: '(Hindi)',
      hint: 'आगे बढ़ने के लिए हिन्दी चुनें',
      available: true
    },
    {
      id: 'ta',
      countryCode: 'IN',
      name: 'தமிழ்',
      sub: '(Tamil)',
      hint: 'Coming soon / जल्द उपलब्ध',
      available: false
    },
    {
      id: 'bn',
      countryCode: 'IN',
      name: 'বাংলা',
      sub: '(Bengali)',
      hint: 'Coming soon / जल्द उपलब्ध',
      available: false
    }
  ];

  const SCREEN2_TRANSLATIONS = {
    en: {
      title: 'Welcome to MediKiosk',
      desc: 'Choose your preferred language to begin your health check',
      continueBtn: 'Continue'
    },
    hi: {
      title: 'MediKiosk में आपका स्वागत है',
      desc: 'स्वास्थ्य जांच शुरू करने के लिए अपनी पसंदीदा भाषा चुनें',
      continueBtn: 'आगे बढ़ें'
    }
  };

  function LanguageSelection(props) {
    const initialLanguage = props.initialLanguage || 'en';
    const controlledLanguage = props.selectedLanguage;
    const onLanguageChange = props.onLanguageChange;
    const onContinue = props.onContinue;

    // React state for language selection
    const [language, setLanguage] = useState(controlledLanguage || initialLanguage);

    useEffect(() => {
      if (controlledLanguage && controlledLanguage !== language) {
        setLanguage(controlledLanguage);
      }
    }, [controlledLanguage]);

    const handleSelectLanguage = (langId, available) => {
      if (!available) return;
      setLanguage(langId);
      if (onLanguageChange) {
        onLanguageChange(langId);
      }
    };

    const handleContinueClick = () => {
      if (onContinue) {
        onContinue(language);
      }
    };

    const t = SCREEN2_TRANSLATIONS[language] || SCREEN2_TRANSLATIONS.en;

    return h('div', { className: 'react-screen2-wrapper', style: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
      // Header
      h('div', { className: 'tab-header-center' },
        h('div', { className: 'icon-bubble-soft' },
          h('svg', { viewBox: '0 0 24 24', width: 28, height: 28, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('path', { d: 'M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
          )
        ),
        h('h1', { className: 'tab-main-title' }, t.title),
        h('p', { className: 'tab-main-desc' }, t.desc)
      ),

      // Grid
      h('div', { className: 'language-grid' },
        LANGUAGES.map(lang => {
          const isSelected = language === lang.id;
          const isAvailable = lang.available;

          return h('div', {
            key: lang.id,
            className: 'lang-card ' + (isSelected ? 'selected ' : '') + (!isAvailable ? 'disabled' : ''),
            'data-lang': lang.id,
            role: 'button',
            tabIndex: isAvailable ? 0 : -1,
            onClick: () => handleSelectLanguage(lang.id, isAvailable),
            onKeyDown: (e) => {
              if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleSelectLanguage(lang.id, isAvailable);
              }
            }
          },
            // Card top
            h('div', { className: 'lang-card-top' },
              h('span', { className: 'country-code' }, lang.countryCode),
              isAvailable ? h('div', { className: 'check-badge' },
                h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: '#FFFFFF', strokeWidth: 3 },
                  h('path', { d: 'M20 6L9 17l-5-5' })
                )
              ) : null
            ),
            // Card body
            h('div', { className: 'lang-card-body' },
              h('strong', { className: 'lang-name' },
                lang.name,
                ' ',
                h('span', { className: 'lang-sub' }, lang.sub)
              ),
              h('span', { className: 'lang-hint' }, lang.hint)
            )
          );
        })
      ),

      // Actions
      h('div', { className: 'cta-action-group' },
        h('button', {
          className: 'btn btn-primary',
          id: 'btnContinueLang',
          type: 'button',
          onClick: handleContinueClick
        },
          h('span', null, t.continueBtn),
          h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 },
            h('path', { d: 'M5 12h14M12 5l7 7-7 7' })
          )
        )
      )
    );
  }

  LanguageSelection.LANGUAGES = LANGUAGES;
  LanguageSelection.TRANSLATIONS = SCREEN2_TRANSLATIONS;

  return LanguageSelection;
}));
