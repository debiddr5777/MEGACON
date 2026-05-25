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
});
