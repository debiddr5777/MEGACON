document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     MOBILE NAVIGATION MENU
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');

  menuToggle.addEventListener('click', () => {
    navbar.classList.toggle('open');
    menuToggle.classList.toggle('active');
  });

  // Close nav on click outside or on item click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navbar.classList.remove('open');
      menuToggle.classList.remove('active');
      
      // Update active nav class
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  /* ==========================================================================
     THEME TOGGLE
     ========================================================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');

  function setTheme(isLight) {
    if (isLight) {
      document.documentElement.classList.add('light-theme');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      localStorage.setItem('megaconTheme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      localStorage.setItem('megaconTheme', 'dark');
    }
  }

  // Load saved theme — default to light
  const savedTheme = localStorage.getItem('megaconTheme');
  if (savedTheme !== 'dark') {
    setTheme(true);
  }

  themeToggle.addEventListener('click', () => {
    const isLightNow = document.documentElement.classList.contains('light-theme');
    setTheme(!isLightNow);
  });

  /* ==========================================================================
     INTERACTIVE MASCOT DIALOGUE CONTROLS
     ========================================================================== */
  /* Mascot dialogue controls removed as per updated design */

  /* ==========================================================================
     DIMENSIONS SIZE MATRIX FILTER HIGHLIGHTING
     ========================================================================== */
  const dimButtons = document.querySelectorAll('#dimension-select-btns button');
  const tableRows = document.querySelectorAll('#dimensions-table tbody tr');

  dimButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Highlight filter button
      dimButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-width');

      tableRows.forEach(row => {
        const rowWidth = row.getAttribute('data-width');
        if (filterVal === 'all' || rowWidth === filterVal) {
          row.classList.add('highlight-tr');
        } else {
          row.classList.remove('highlight-tr');
        }
      });
    });
  });

  /* ==========================================================================
     TECHNICAL SPECIFICATION TABS
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  /* ==========================================================================
     DYNAMIC BUDGET COST CALCULATOR
     ========================================================================== */
  const areaInput = document.getElementById('calc-area');
  const areaSlider = document.getElementById('calc-area-range');
  const bhkSelect = document.getElementById('calc-bhk');
  const customRoomsBox = document.getElementById('custom-rooms-box');
  const bedroomsInput = document.getElementById('calc-bedrooms');
  const kitchensInput = document.getElementById('calc-kitchens');
  const standardSelect = document.getElementById('calc-standard');
  const blockWidthSelect = document.getElementById('calc-block-width');
  const rodSelect = document.getElementById('calc-rod');

  // Outputs
  const totalPriceLbl = document.getElementById('total-price-lbl');
  const blockCbmLbl = document.getElementById('block-cbm-lbl');
  const blockPriceLbl = document.getElementById('block-price-lbl');
  const steelKgLbl = document.getElementById('steel-kg-lbl');
  const steelPriceLbl = document.getElementById('steel-price-lbl');
  const adhesiveBagsLbl = document.getElementById('adhesive-bags-lbl');
  const adhesivePriceLbl = document.getElementById('adhesive-price-lbl');
  const laborPriceLbl = document.getElementById('labor-price-lbl');

  // Chart slices
  const sliceBlocks = document.getElementById('bar-slice-blocks');
  const sliceSteel = document.getElementById('bar-slice-steel');
  const sliceAdhesive = document.getElementById('bar-slice-adhesive');
  const sliceLabor = document.getElementById('bar-slice-labor');

  // Sync Input and Slider range
  areaInput.addEventListener('input', () => {
    areaSlider.value = areaInput.value;
    calculateBudget();
  });

  areaSlider.addEventListener('input', () => {
    areaInput.value = areaSlider.value;
    calculateBudget();
  });

  bhkSelect.addEventListener('change', () => {
    if (bhkSelect.value === 'custom') {
      customRoomsBox.style.display = 'grid';
    } else {
      customRoomsBox.style.display = 'none';
    }
    calculateBudget();
  });

  [bedroomsInput, kitchensInput, standardSelect, blockWidthSelect, rodSelect].forEach(element => {
    element.addEventListener('change', calculateBudget);
    element.addEventListener('input', calculateBudget);
  });

  function calculateBudget() {
    const area = parseFloat(areaInput.value) || 0;
    const bhk = bhkSelect.value;
    const standard = standardSelect.value;
    const thicknessMm = parseFloat(blockWidthSelect.value);
    const rodType = rodSelect.value;

    // 1. Estimate Wall Area based on Configuration / BHK
    let wallAreaMultiplier = 1.5; // Default for 2 BHK
    if (bhk === '1') wallAreaMultiplier = 1.2;
    else if (bhk === '2') wallAreaMultiplier = 1.5;
    else if (bhk === '3') wallAreaMultiplier = 1.8;
    else if (bhk === '4') wallAreaMultiplier = 2.2;
    else if (bhk === 'custom') {
      const bedrooms = parseFloat(bedroomsInput.value) || 1;
      const kitchens = parseFloat(kitchensInput.value) || 1;
      wallAreaMultiplier = (bedrooms * 0.6) + (kitchens * 0.4);
    }

    const wallAreaSqFt = area * wallAreaMultiplier;

    // Convert thickness mm to meters
    const thicknessMeters = thicknessMm / 1000;

    // Wall Area in Sq.Meters (1 Sq.Ft = 0.0929 Sq.Meters)
    const wallAreaSqM = wallAreaSqFt * 0.0929;

    // Total volume of AAC blocks needed in CBM (Cubic Meters)
    let blockVolumeCBM = wallAreaSqM * thicknessMeters;
    
    // Add 5% waste factor
    blockVolumeCBM = blockVolumeCBM * 1.05;

    // Qty of single blocks (standard size 600mm x 200mm = 0.12 sq.m face area)
    const singleBlockVol = 0.6 * 0.2 * thicknessMeters;
    const totalBlocksCount = Math.round(blockVolumeCBM / singleBlockVol) || 0;

    // 2. Estimate Steel Reinforcement rods
    // Standard rule: ~1.5 kgs of steel per sq ft of builtup area
    let steelMultiplier = 1.5;
    if (standard === 'economy') steelMultiplier = 1.1;
    else if (standard === 'standard') steelMultiplier = 1.5;
    else if (standard === 'luxury') steelMultiplier = 2.0;

    // Steel type factor
    let rodMultiplier = 1.0;
    if (rodType === '500') rodMultiplier = 1.0;
    else if (rodType === '550') rodMultiplier = 1.15;
    else if (rodType === '600') rodMultiplier = 1.3;

    const totalSteelKg = Math.round(area * steelMultiplier * rodMultiplier);

    // 3. Estimate Joint Mortar Adhesive bags (1 bag = 40kg, covers approx 0.4 CBM of blocks)
    const adhesiveBags = Math.round(blockVolumeCBM / 0.4) || 1;

    // ==========================================
    // COSTING CALCULATIONS (INR)
    // ==========================================
    const pricePerCBM = 4200; // Base price for Premium MEGACON Blocks
    const pricePerSteelKg = 62; // Average TMT steel rod rate
    const pricePerAdhesiveBag = 450; // High-grade joint compound
    const laborRatePerSqFt = 25; // Standard masonry labor

    const blocksCost = blockVolumeCBM * pricePerCBM;
    const steelCost = totalSteelKg * pricePerSteelKg;
    const adhesiveCost = adhesiveBags * pricePerAdhesiveBag;
    const laborCost = wallAreaSqFt * laborRatePerSqFt;

    const grandTotal = blocksCost + steelCost + adhesiveCost + laborCost;

    // Update Text Labels
    totalPriceLbl.innerHTML = `&#8377; ${formatCurrency(Math.round(grandTotal))}`;
    blockCbmLbl.innerText = `${blockVolumeCBM.toFixed(2)} CBM (${totalBlocksCount} Blocks)`;
    blockPriceLbl.innerHTML = `&#8377; ${formatCurrency(Math.round(blocksCost))}`;
    
    steelKgLbl.innerText = `${totalSteelKg.toLocaleString()} Kgs (Fe ${rodType})`;
    steelPriceLbl.innerHTML = `&#8377; ${formatCurrency(Math.round(steelCost))}`;

    adhesiveBagsLbl.innerText = `${adhesiveBags} Bags (40kg compound)`;
    adhesivePriceLbl.innerHTML = `&#8377; ${formatCurrency(Math.round(adhesiveCost))}`;

    laborPriceLbl.innerHTML = `&#8377; ${formatCurrency(Math.round(laborCost))}`;

    // Update Chart Slices
    const blocksPct = (blocksCost / grandTotal) * 100;
    const steelPct = (steelCost / grandTotal) * 100;
    const adhesivePct = (adhesiveCost / grandTotal) * 100;
    const laborPct = (laborCost / grandTotal) * 100;

    sliceBlocks.style.width = `${blocksPct}%`;
    sliceSteel.style.width = `${steelPct}%`;
    sliceAdhesive.style.width = `${adhesivePct}%`;
    sliceLabor.style.width = `${laborPct}%`;

    // Tooltips
    sliceBlocks.title = `Blocks: ${blocksPct.toFixed(1)}%`;
    sliceSteel.title = `Steel: ${steelPct.toFixed(1)}%`;
    sliceAdhesive.title = `Adhesive: ${adhesivePct.toFixed(1)}%`;
    sliceLabor.title = `Labor: ${laborPct.toFixed(1)}%`;
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-IN').format(val);
  }

  // Initial Calculation
  calculateBudget();

  /* ==========================================================================
     CALCULATOR PERSISTENCE WITH LOCALSTORAGE
     ========================================================================== */
  function saveCalculatorState() {
    const state = {
      area: areaInput.value,
      bhk: bhkSelect.value,
      standard: standardSelect.value,
      blockWidth: blockWidthSelect.value,
      rodType: rodSelect.value,
      bedrooms: bedroomsInput.value,
      kitchens: kitchensInput.value
    };
    localStorage.setItem('megacon-calc-state', JSON.stringify(state));
  }

  function loadCalculatorState() {
    const saved = localStorage.getItem('megacon-calc-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        areaInput.value = state.area || 1200;
        areaSlider.value = state.area || 1200;
        bhkSelect.value = state.bhk || '2';
        if (state.bhk === 'custom') customRoomsBox.style.display = 'grid';
        standardSelect.value = state.standard || 'standard';
        blockWidthSelect.value = state.blockWidth || '200';
        rodSelect.value = state.rodType || '550';
        if (state.bedrooms) bedroomsInput.value = state.bedrooms;
        if (state.kitchens) kitchensInput.value = state.kitchens;
        calculateBudget();
      } catch(e) {}
    }
  }

  [areaInput, areaSlider, bhkSelect, standardSelect, blockWidthSelect, rodSelect, bedroomsInput, kitchensInput].forEach(el => {
    el.addEventListener('change', saveCalculatorState);
    el.addEventListener('input', saveCalculatorState);
  });

  loadCalculatorState();

  /* ==========================================================================
     QUOTE REQUEST FORM HANDLER (Formspree + localStorage)
     ========================================================================== */
  const quoteForm = document.getElementById('quote-form');
  const formFeedback = document.getElementById('form-feedback');
  const phoneInput = document.getElementById('form-phone');

  // Restrict phone input to only digits (0-9)
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formFeedback.className = 'form-feedback-message';
    formFeedback.innerText = 'Submitting your quotation request...';

    // Save to localStorage as backup
    const contactData = {
      name: document.getElementById('form-name').value,
      phone: document.getElementById('form-phone').value,
      location: document.getElementById('form-site').value,
      requirement: document.getElementById('form-requirement').value,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('megacon-contact-submission', JSON.stringify(contactData));

    const formData = new FormData(quoteForm);

    fetch(quoteForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        formFeedback.className = 'form-feedback-message success';
        formFeedback.innerText = '✓ Quote request submitted! Our sales team will contact you shortly.';
        quoteForm.reset();
      } else {
        formFeedback.className = 'form-feedback-message error';
        formFeedback.innerText = '✗ Server error. Please email info@megaconinfra.com directly.';
      }
    })
    .catch(() => {
      formFeedback.className = 'form-feedback-message success';
      formFeedback.innerText = '✓ Request saved locally. Our team will reach out soon.';
      quoteForm.reset();
    });
  });

  /* ==========================================================================
     SCROLL ANIMATIONS (Intersection Observer)
     ========================================================================== */
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));

  /* ==========================================================================
     LOADING SCREEN
     ========================================================================== */
  const loader = document.getElementById('loader');
  if (loader) {
    const loaderVideo = loader.querySelector('video');
    const startTime = Date.now();
    const hideLoader = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 3200 - elapsed);
      setTimeout(() => {
        loader.classList.add('hidden');
        if (loaderVideo) { loaderVideo.pause(); loaderVideo.remove(); }
      }, remaining);
    };
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }
    setTimeout(() => {
      if (!loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        if (loaderVideo) { loaderVideo.pause(); loaderVideo.remove(); }
      }
    }, 6000);
  }

  /* ==========================================================================
     AI CHAT ASSISTANT
     ========================================================================== */

  const knowledgeBase = [
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste', 'howdy'],
      answer: 'Hello! 👋 Welcome to MEGACON INFRACRETE. How can I assist you today? You can ask about our AAC blocks, technical specs, pricing, or contact details.'
    },
    {
      keywords: ['what is megacon', 'who are you', 'company', 'about', 'tell me about'],
      answer: 'MEGACON INFRACRETE Pvt. Ltd. is a premium AAC (Autoclaved Aerated Concrete) blocks manufacturer based in Khordha, Odisha. We produce high-precision, IS 2185 (Part 3) compliant AAC blocks with superior compressive strength, thermal insulation, and fire resistance.'
    },
    {
      keywords: ['address', 'located', 'location', 'plant', 'factory', 'where'],
      answer: '📍 Our manufacturing plant & office is located at: Plot No. 3293, Goda Lokanath Road, Dadhimachagadia, Kaipadar, Khordha, Odisha - 752056.'
    },
    {
      keywords: ['phone', 'call', 'contact', 'mobile', 'whatsapp', 'reach'],
      answer: '📞 You can reach our sales support desk at:\n• +91 78305 03010\n• +91 78307 05080\nCall us for quotes, sample requests, or any project inquiries.'
    },
    {
      keywords: ['email', 'mail', 'info@', 'send email'],
      answer: '✉️ Email us at: info@megaconinfra.com\nWe respond within 24 hours.'
    },
    {
      keywords: ['gst', 'gstin', 'tax', 'pan', 'registration'],
      answer: '📋 Our tax details:\n• GSTIN: 21AASCM0769R1ZP\n• PAN: AASCM0769R'
    },
    {
      keywords: ['aac block', 'product', 'blocks', 'what do you make', 'manufacture'],
      answer: 'We manufacture premium AAC (Autoclaved Aerated Concrete) blocks made from 100% pure fly ash. Our blocks come in standard size 600mm x 200mm with thicknesses from 75mm up to 400mm. They are lightweight, fire-resistant, thermally insulating, and dimensionally accurate to ±1.0mm.'
    },
    {
      keywords: ['dimension', 'size', 'length', 'height', 'width', 'thickness', 'measurement'],
      answer: '📐 Standard MEGACON Block Spec:\n• Length: 600 mm (24")\n• Height: 200 mm (8")\n• Widths available: 75mm, 100mm, 150mm, 200mm, 300mm, 400mm\n\nTolerance: Length & Height ±3mm, Width ±2mm.'
    },
    {
      keywords: ['price', 'cost', 'rate', 'pricing', 'how much', 'budget', 'quote'],
      answer: '💰 Our blocks are priced at approximately ₹4,200 per CBM. For a complete project estimate, use our Budget Calculator in the navigation menu. You can also request a personalized quote via the Contact form or call +91 78305 03010.'
    },
    {
      keywords: ['strength', 'compressive', 'density', 'how strong'],
      answer: '💪 MEGACON AAC blocks deliver:\n• Compressive Strength: > 4.0 N/mm² (IS minimum is 3.0)\n• Dry Density: 560 - 640 Kg/m³\n• This means they are lightweight yet stronger than traditional red bricks!'
    },
    {
      keywords: ['fire', 'fire rating', 'fire resistance', 'safety'],
      answer: '🛡️ Our AAC blocks provide 4 to 6 hours of fire resistance (depending on block width). They block heat transfer and stay structurally stable under intense fire — ideal for high-rise and commercial buildings.'
    },
    {
      keywords: ['thermal', 'insulation', 'cool', 'heat', 'temperature', 'energy'],
      answer: '❄️ MEGACON AAC blocks have a thermal conductivity of 0.16 - 0.21 W/mK — that\'s 4x better than red clay bricks. This keeps your interiors cool in summer and warm in winter, reducing AC costs significantly.'
    },
    {
      keywords: ['vs', 'versus', 'compared', 'red brick', 'clay brick', 'better than'],
      answer: '🏆 MEGACON AAC vs Red Clay Bricks:\n• Size Precision: ±1.0mm vs ±3.15mm ✅\n• Compressive Strength: 4.0+ vs 2.5-3.0 N/mm² ✅\n• Thermal Insulation: 0.16-0.21 vs 0.81 W/mK ✅\n• Weight: 560-640 vs 1950-2000 kg/m³ ✅\n• Fire Resistance: 4-6 Hrs vs 2 Hrs ✅\n• Water Absorption: <10% vs 15-20% ✅'
    },
    {
      keywords: ['water', 'absorption', 'moisture', 'damp'],
      answer: '💧 Our AAC blocks absorb less than 10% of their dry weight in water — half that of red clay bricks. This means less dampness and longer-lasting walls.'
    },
    {
      keywords: ['sound', 'acoustic', 'noise', 'dB', 'insulation'],
      answer: '🔇 MEGACON AAC blocks block 38 to 44 dB of sound, compared to only 30-34 dB for red clay bricks. Perfect for peaceful indoor environments.'
    },
    {
      keywords: ['shrinkage', 'crack', 'drying', 'settlement'],
      answer: '📉 Our drying shrinkage is just 0.04% (IS max allows 0.05%). This means minimal cracking and superior long-term dimensional stability.'
    },
    {
      keywords: ['is 2185', 'bis', 'standard', 'compliance', 'certification', 'iso'],
      answer: '✅ MEGACON blocks are manufactured strictly to IS 2185 (Part 3) standards. Our plant is ISO Certified. We use high-pressure autoclave chambers at 12 bar / 190°C to form Tobermorite crystals for maximum strength.'
    },
    {
      keywords: ['delivery', 'shipping', 'transport', 'supply', 'deliver'],
      answer: '🚚 We deliver across Khordha, Bhubaneswar, Cuttack, Puri, Rourkela, Berhampur, Sambalpur, Balasore, Bhadrak, Baripada, Jharsuguda, Angul, Nayagarh, Dhenkanal, and other regions in Odisha.'
    },
    {
      keywords: ['calculator', 'estimate', 'cost calculator', 'budget calculator'],
      answer: '🧮 Head over to the "Cost Calculator" section in the navigation menu! It gives you a real-time estimate of blocks, steel, adhesive, and labor costs based on your project size and configuration.'
    },
    {
      keywords: ['sample', 'free sample', 'load inspection', 'test', 'quality'],
      answer: '📦 Yes! We offer free samples and load inspections. Contact our sales team at +91 78305 03010 or fill out the quote form to schedule a visit.'
    },
    {
      keywords: ['thank', 'thanks', 'thx', 'appreciate'],
      answer: 'You\'re welcome! 😊 If you have more questions, feel free to ask. You can also request a quote or call us at +91 78305 03010 anytime.'
    },
    {
      keywords: ['mortar', 'adhesive', 'joint', 'thin bed'],
      answer: '🧪 We recommend thin-bed joint adhesive for our AAC blocks. You save up to 60% on joint mortar compared to traditional brick-laying. Each 40kg bag covers approximately 0.4 CBM of blocks.'
    },
    {
      keywords: ['steel', 'reinforcement', 'tmt', 'rod', 'fe 500', 'fe 550'],
      answer: '⚡ Our calculator supports Fe 500, Fe 550D (Super Ductile), and Fe 600 TMT reinforcement rods. The right grade depends on your structural requirements — Fe 550D is our recommended standard.'
    },
    {
      keywords: ['labor', 'masonry', 'worker', 'installation', 'build'],
      answer: '👷 Our standard masonry labor estimate is ₹25 per Sq.Ft. AAC blocks are easier and faster to install than red bricks due to their precise dimensions and lightweight nature.'
    },
    {
      keywords: ['brochure', 'print', 'pdf', 'catalog'],
      answer: '📄 You can view and print our detailed brochure by clicking "Open Printable Brochure" link in the website footer. It contains all technical specs, dimensions, and comparison data in A4 format.'
    }
  ];

  const chatToggle = document.getElementById('chat-toggle');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  function toggleChat(open) {
    if (open) {
      chatPanel.classList.add('open');
      chatToggle.style.display = 'none';
      chatInput.focus();
    } else {
      chatPanel.classList.remove('open');
      chatToggle.style.display = 'flex';
    }
  }

  chatToggle.addEventListener('click', () => toggleChat(true));
  chatClose.addEventListener('click', () => toggleChat(false));

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = `<div class="msg-content">${text}</div><div class="msg-time">Just now</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.id = 'chat-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function findAnswer(query, formState) {
    const q = query.toLowerCase().trim();

    if (formState.active) {
      return null;
    }

    const quoteTriggers = ['get quote', 'request quote', 'submit enquiry', 'book order', 'place order', 'i need quote', 'want quote', 'quote request', 'contact form', 'enquire now', 'i want to order', 'submit request'];
    for (const t of quoteTriggers) {
      if (q.includes(t)) return '__START_FORM__';
    }

    for (const entry of knowledgeBase) {
      for (const kw of entry.keywords) {
        if (q.includes(kw)) {
          return entry.answer;
        }
      }
    }
    return null;
  }

  function getFallbackAnswer() {
    return 'I\'m not sure I understand. 🤔 Try asking about:\n\n• Our AAC block products & dimensions\n• Technical specifications & standards\n• Pricing & budget estimates\n• Contact details & delivery areas\n• AAC vs Red clay brick comparison\n\nOr type "hello" to start over!';
  }

  const formState = { active: false, step: 'name', data: {} };
  const formQuestions = {
    name: "Let's get started! \u{1F680}\n\nPlease enter your full name:",
    phone: 'Great! Now enter your 10-digit phone number:',
    location: 'Which city/location in Odisha should we deliver to?',
    requirement: 'Finally, briefly describe your project requirement (e.g., total Sq.Ft or block volume needed):'
  };

  const suggestionSets = {
    main: [
      'About MEGACON', 'Block Dimensions', 'Technical Specs',
      'Pricing', 'AAC vs Red Brick', 'Delivery Areas',
      'Get Quote', 'Contact Info'
    ],
    quote: [
      'Back to Menu'
    ]
  };

  const chipToQuery = {
    'About MEGACON': 'tell me about megacon',
    'Block Dimensions': 'block dimensions',
    'Technical Specs': 'technical specifications',
    'Pricing': 'pricing',
    'AAC vs Red Brick': 'aac vs red brick',
    'Delivery Areas': 'delivery areas',
    'Get Quote': 'get quote',
    'Contact Info': 'contact info'
  };

  const suggestionsContainer = document.getElementById('chat-suggestions');

  function renderSuggestions(setName) {
    suggestionsContainer.innerHTML = '';
    const chips = suggestionSets[setName] || [];
    chips.forEach(label => {
      const chip = document.createElement('span');
      chip.className = 'chat-suggestion-chip';
      chip.textContent = label;
      chip.addEventListener('click', () => handleChipClick(label));
      suggestionsContainer.appendChild(chip);
    });
  }

  function clearSuggestions() {
    suggestionsContainer.innerHTML = '';
  }

  function handleChipClick(label) {
    if (label === 'Back to Menu') {
      renderSuggestions('main');
      return;
    }
    const query = chipToQuery[label] || label;
    chatInput.value = query;
    handleSend();
  }

  function startFormFlow() {
    formState.active = true;
    formState.step = 'name';
    formState.data = {};
    clearSuggestions();
    addMessage(formQuestions.name, 'bot');
  }

  function handleFormInput(text) {
    const step = formState.step;

    if (step === 'name') {
      if (text.length < 2) {
        addMessage('Please enter a valid name (at least 2 characters).', 'bot');
        return;
      }
      formState.data.name = text;
      formState.step = 'phone';
      addMessage(formQuestions.phone, 'bot');
    }
    else if (step === 'phone') {
      const digits = text.replace(/[^0-9]/g, '');
      if (digits.length !== 10) {
        addMessage('Please enter a valid 10-digit phone number.', 'bot');
        return;
      }
      formState.data.phone = digits;
      formState.step = 'location';
      addMessage(formQuestions.location, 'bot');
    }
    else if (step === 'location') {
      if (text.length < 2) {
        addMessage('Please enter a valid city/location name.', 'bot');
        return;
      }
      formState.data.location = text;
      formState.step = 'requirement';
      addMessage(formQuestions.requirement, 'bot');
    }
    else if (step === 'requirement') {
      if (text.length < 5) {
        addMessage('Please enter a brief project description (at least 5 characters).', 'bot');
        return;
      }
      formState.data.requirement = text;
      formState.data.timestamp = new Date().toISOString();
      submitChatForm();
    }
  }

  function submitChatForm() {
    showTyping();

    localStorage.setItem('megacon-contact-submission', JSON.stringify(formState.data));

    const formData = new FormData();
    formData.append('_subject', 'New MEGACON Quotation Request (from Chat)');
    formData.append('name', formState.data.name);
    formData.append('phone', formState.data.phone);
    formData.append('location', formState.data.location);
    formData.append('requirement', formState.data.requirement);

    fetch('https://formspree.io/f/mldnkgoe', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      hideTyping();
      if (response.ok) {
        addMessage('Thank you, ' + formState.data.name + '! Your quotation request has been submitted successfully. Our sales team will contact you within 24 hours at ' + formState.data.phone + '.\n\n📌 We also saved a copy locally for your reference.', 'bot');
      } else {
        addMessage('Thank you, ' + formState.data.name + '! Your details have been saved locally. Our sales team will reach out to you soon at ' + formState.data.phone + '.\n\n(You can also email us at info@megaconinfra.com)', 'bot');
      }
      formState.active = false;
      renderSuggestions('main');
    })
    .catch(() => {
      hideTyping();
      addMessage('Thank you, ' + formState.data.name + '! Your details have been saved locally. Our sales team will contact you shortly at ' + formState.data.phone + '.\n\nYou can also email us at info@megaconinfra.com for immediate assistance.', 'bot');
      formState.active = false;
      renderSuggestions('main');
    });
  }

  function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    if (formState.active) {
      addMessage(text, 'user');
      showTyping();
      setTimeout(() => {
        hideTyping();
        handleFormInput(text);
      }, 400 + Math.random() * 300);
      return;
    }

    addMessage(text, 'user');
    showTyping();
    clearSuggestions();

    setTimeout(() => {
      hideTyping();
      const answer = findAnswer(text, formState);
      if (answer === '__START_FORM__') {
        startFormFlow();
      } else if (answer) {
        addMessage(answer, 'bot');
        renderSuggestions('main');
      } else {
        addMessage(getFallbackAnswer(), 'bot');
        renderSuggestions('main');
      }
    }, 600 + Math.random() * 400);
  }

  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  renderSuggestions('main');

  /* ==========================================================================
     HERO CONSTRUCTION CANVAS ANIMATION
     ========================================================================== */
  const ConstructionAnimation = (() => {
    const canvas = document.getElementById('construction-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const statsEl = document.getElementById('construction-stats');
    const finalMessageEl = document.getElementById('final-message');
    const floorsEl = document.getElementById('stat-floors');
    const blocksEl = document.getElementById('stat-blocks');
    const heightEl = document.getElementById('stat-height');

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let animationId = null;
    let startTime = 0;
    let phase = 'building'; // 'building', 'windows', 'finishing', 'message'
    let phaseStartTime = 0;

    // Building parameters
    const building = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      floors: 0,
      targetFloors: 45,
      currentFloor: 0,
      floorHeight: 0,
      blockSize: { w: 0, h: 0 },
      blocksPerFloor: 0,
      blocksPlaced: 0,
      totalBlocks: 0,
      windows: [],
      cranes: [],
      particles: []
    };

    // Colors (MEGACON brand)
    const colors = {
      block: '#D97706',           // Amber 600
      blockLight: '#F59E0B',      // Amber 500
      blockDark: '#B45309',       // Amber 700
      mortar: '#374151',          // Gray 700
      window: '#1E3A5F',          // Dark blue
      windowGlass: '#3B82F6',     // Blue 500
      windowReflection: '#60A5FA', // Blue 400
      skyTop: '#0B1120',
      skyBottom: '#111827',
      crane: '#4B5563',
      craneAccent: '#F59E0B',
      ground: '#1F2937',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      messageBg: '#FFFFFF',
      messageText: '#0B1120'
    };

    function resize() {
      const wrapper = canvas.parentElement;
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);

      // Building dimensions - centered, responsive
      const maxBuildingWidth = Math.min(width * 0.45, 320);
      building.width = maxBuildingWidth;
      building.blockSize.w = Math.max(12, building.width / 22);
      building.blockSize.h = Math.max(6, building.blockSize.w * 0.45);
      building.floorHeight = building.blockSize.h * 1.15;
      building.blocksPerFloor = Math.floor(building.width / building.blockSize.w);
      building.totalBlocks = building.targetFloors * building.blocksPerFloor * 2; // 2 layers per floor
      
      building.x = (width - building.width) / 2;
      building.y = height - 80; // Ground level
      
      // Initialize cranes
      if (building.cranes.length === 0) {
        building.cranes = [
          { x: building.x - 80, y: building.y, height: 0, targetHeight: 0, angle: 0, swingDir: 1 },
          { x: building.x + building.width + 80, y: building.y, height: 0, targetHeight: 0, angle: 0, swingDir: -1 }
        ];
      }
    }

    function drawSky() {
      // Gradient sky
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, colors.skyTop);
      grad.addColorStop(1, colors.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Stars (subtle)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      for (let i = 0; i < 30; i++) {
        const x = (i * 127 + Math.sin(Date.now() * 0.0001 + i) * 2) % width;
        const y = (i * 73 + Math.cos(Date.now() * 0.00008 + i) * 1.5) % (height * 0.6);
        const size = 0.5 + (i % 3) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawGround() {
      // Ground
      ctx.fillStyle = colors.ground;
      ctx.fillRect(0, building.y, width, height - building.y);
      
      // Ground line
      ctx.strokeStyle = colors.mortar;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, building.y);
      ctx.lineTo(width, building.y);
      ctx.stroke();
    }

    function drawCranes() {
      building.cranes.forEach(crane => {
        const baseX = crane.x;
        const baseY = building.y;
        
        // Crane height grows with building
        const maxCraneHeight = building.y - (building.y - building.targetFloors * building.floorHeight) - 100;
        crane.targetHeight = Math.min(maxCraneHeight, building.currentFloor * building.floorHeight + 100);
        crane.height += (crane.targetHeight - crane.height) * 0.05;
        
        // Swing animation
        crane.angle += 0.003 * crane.swingDir;
        if (Math.abs(crane.angle) > 0.3) crane.swingDir *= -1;
        
        const towerTopY = baseY - crane.height;
        const jibLength = 120;
        const jibEndX = baseX + Math.cos(crane.angle) * jibLength * (crane.x < width/2 ? 1 : -1);
        const jibEndY = towerTopY - Math.sin(Math.abs(crane.angle)) * 30;
        
        // Tower
        ctx.strokeStyle = colors.crane;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX, towerTopY);
        ctx.stroke();
        
        // Tower cross braces
        ctx.lineWidth = 1.5;
        for (let y = baseY; y > towerTopY; y -= 25) {
          ctx.beginPath();
          ctx.moveTo(baseX - 8, y);
          ctx.lineTo(baseX + 8, y - 15);
          ctx.moveTo(baseX + 8, y);
          ctx.lineTo(baseX - 8, y - 15);
          ctx.stroke();
        }
        
        // Jib (horizontal arm)
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(baseX, towerTopY);
        ctx.lineTo(jibEndX, jibEndY);
        ctx.stroke();
        
        // Counter-jib
        const counterJibLength = 50;
        const counterJibX = baseX - Math.cos(crane.angle) * counterJibLength * (crane.x < width/2 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(baseX, towerTopY);
        ctx.lineTo(counterJibX, jibEndY);
        ctx.stroke();
        
        // Cable and hook
        const hookX = jibEndX;
        const hookY = jibEndY + Math.min(crane.height * 0.6, 200);
        
        ctx.strokeStyle = colors.crane;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(jibEndX, jibEndY);
        ctx.lineTo(hookX, hookY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Hook
        ctx.fillStyle = colors.craneAccent;
        ctx.beginPath();
        ctx.arc(hookX, hookY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Crane operator cabin
        ctx.fillStyle = colors.crane;
        ctx.fillRect(baseX - 12, towerTopY - 30, 24, 20);
        ctx.fillStyle = colors.windowGlass;
        ctx.fillRect(baseX - 10, towerTopY - 28, 8, 12);
        ctx.fillRect(baseX + 2, towerTopY - 28, 8, 12);
      });
    }

    function drawBuilding() {
      const floorsBuilt = Math.floor(building.currentFloor);
      const currentFloorProgress = building.currentFloor - floorsBuilt;
      
      // Draw completed floors
      for (let f = 0; f < floorsBuilt; f++) {
        drawFloor(f, 1.0);
      }
      
      // Draw current floor being built
      if (floorsBuilt < building.targetFloors) {
        drawFloor(floorsBuilt, currentFloorProgress);
      }
      
      // Draw windows for completed floors
      if (phase === 'windows' || phase === 'finishing' || phase === 'message') {
        drawWindows();
      }
    }

    function drawFloor(floorIndex, progress) {
      const floorY = building.y - (floorIndex + 1) * building.floorHeight;
      const blocksInFloor = building.blocksPerFloor;
      
      // Two layers of blocks per floor (staggered)
      for (let layer = 0; layer < 2; layer++) {
        const layerProgress = Math.min(1, Math.max(0, progress * 2 - layer));
        if (layerProgress <= 0) continue;
        
        const stagger = layer === 0 ? 0 : building.blockSize.w / 2;
        const blocksToDraw = Math.ceil(blocksInFloor * layerProgress);
        
        for (let b = 0; b < blocksToDraw; b++) {
          const blockX = building.x + stagger + b * building.blockSize.w;
          const blockY = floorY + (layer === 1 ? building.blockSize.h * 0.5 : 0);
          
          if (blockX + building.blockSize.w > building.x + building.width) continue;
          
          drawBlock(blockX, blockY, building.blockSize.w, building.blockSize.h, layer);
        }
      }
      
      // Floor slab
      ctx.fillStyle = colors.mortar;
      ctx.fillRect(building.x - 10, floorY + building.blockSize.h * 1.5, building.width + 20, 4);
    }

    function drawBlock(x, y, w, h, layer) {
      // Block shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x + 2, y + 2, w, h);
      
      // Block base
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, colors.blockLight);
      grad.addColorStop(0.5, colors.block);
      grad.addColorStop(1, colors.blockDark);
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      
      // Block highlight (top edge)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x, y, w, 2);
      
      // Block side highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x, y, 2, h);
      
      // Mortar lines
      ctx.strokeStyle = colors.mortar;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      
      // Vertical mortar (staggered)
      if (layer === 0 || x > building.x) {
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
      }
      
      // AAC texture - subtle air pockets
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      const pocketCount = Math.max(2, Math.floor(w / 8));
      for (let p = 0; p < pocketCount; p++) {
        const px = x + 4 + (p * (w - 8) / pocketCount) + (Math.random() - 0.5) * 2;
        const py = y + 3 + Math.random() * (h - 6);
        const pr = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawWindows() {
      const floorsBuilt = Math.floor(building.currentFloor);
      const windowCols = 3;
      const windowRows = 1;
      const windowW = building.width / (windowCols + 1) * 0.6;
      const windowH = building.floorHeight * 0.55;
      
      for (let f = 0; f < floorsBuilt; f++) {
        const floorY = building.y - (f + 1) * building.floorHeight;
        const windowY = floorY + (building.floorHeight - windowH) / 2;
        
        for (let c = 0; c < windowCols; c++) {
          const windowX = building.x + (building.width / (windowCols + 1)) * (c + 1) - windowW / 2;
          
          // Window frame
          ctx.fillStyle = colors.window;
          ctx.fillRect(windowX - 3, windowY - 3, windowW + 6, windowH + 6);
          
          // Window glass with reflection
          const glassGrad = ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowH);
          glassGrad.addColorStop(0, colors.windowGlass);
          glassGrad.addColorStop(0.5, colors.window);
          glassGrad.addColorStop(1, colors.windowGlass);
          ctx.fillStyle = glassGrad;
          ctx.fillRect(windowX, windowY, windowW, windowH);
          
          // Reflection stripe
          ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
          ctx.fillRect(windowX, windowY + windowH * 0.3, windowW, windowH * 0.15);
          
          // Window division
          ctx.strokeStyle = colors.window;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(windowX + windowW / 2, windowY);
          ctx.lineTo(windowX + windowW / 2, windowY + windowH);
          ctx.stroke();
        }
      }
    }

    function drawParticles() {
      // Dust particles from construction
      if (phase === 'building' && Math.random() < 0.3) {
        building.particles.push({
          x: building.x + Math.random() * building.width,
          y: building.y - building.currentFloor * building.floorHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 1 - 0.5,
          life: 1,
          size: 1 + Math.random() * 2,
          color: `rgba(245, 158, 11, ${0.3 + Math.random() * 0.4})`
        });
      }
      
      building.particles = building.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity
        p.life -= 0.015;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        return p.life > 0;
      });
    }

    function updateStats() {
      if (floorsEl) floorsEl.textContent = Math.floor(building.currentFloor);
      if (blocksEl) blocksEl.textContent = Math.floor(building.blocksPlaced).toLocaleString();
      if (heightEl) heightEl.textContent = Math.floor(building.currentFloor * 3.2) + 'm';
    }

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Clear
      ctx.clearRect(0, 0, width, height);
      
      drawSky();
      drawGround();
      drawCranes();
      drawBuilding();
      drawParticles();
      
      // Update building progress
      if (phase === 'building') {
        const buildSpeed = 0.008; // floors per ms
        building.currentFloor = Math.min(building.targetFloors, elapsed * buildSpeed);
        building.blocksPlaced = building.currentFloor * building.blocksPerFloor * 2;
        
        if (building.currentFloor >= building.targetFloors) {
          building.currentFloor = building.targetFloors;
          building.blocksPlaced = building.totalBlocks;
          phase = 'windows';
          phaseStartTime = timestamp;
        }
      } else if (phase === 'windows') {
        // Windows appear with a delay
        const windowDelay = 1500;
        if (timestamp - phaseStartTime > windowDelay) {
          phase = 'finishing';
          phaseStartTime = timestamp;
        }
      } else if (phase === 'finishing') {
        // Finishing touches - brief pause
        if (timestamp - phaseStartTime > 1000) {
          phase = 'message';
          phaseStartTime = timestamp;
        }
      } else if (phase === 'message') {
        // Fade in final message
        const fadeDuration = 1500;
        const progress = Math.min(1, (timestamp - phaseStartTime) / fadeDuration);
        const easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        if (finalMessageEl) {
          finalMessageEl.style.opacity = easedProgress;
          finalMessageEl.style.transform = `translateY(${20 * (1 - easedProgress)}px)`;
        }
        
        // Fade out stats
        if (statsEl) {
          statsEl.style.opacity = 1 - easedProgress;
        }
      }
      
      updateStats();
      animationId = requestAnimationFrame(animate);
    }

    function init() {
      resize();
      window.addEventListener('resize', resize);
      animationId = requestAnimationFrame(animate);
    }

    function destroy() {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    }

    // Handle reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Skip animation, show final state
      if (canvas) canvas.style.display = 'none';
      if (finalMessageEl) {
        finalMessageEl.style.opacity = '1';
        finalMessageEl.style.transform = 'translateY(0)';
      }
      if (statsEl) statsEl.style.display = 'none';
      return;
    }

    init();
    return { destroy };
  })();
});
