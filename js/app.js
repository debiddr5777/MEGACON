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
     INTERACTIVE MASCOT DIALOGUE CONTROLS
     ========================================================================== */
  const bubbleAac = document.getElementById('bubble-aac');
  const bubbleBrick = document.getElementById('bubble-brick');
  const btnShowAac = document.getElementById('btn-show-aac');
  const btnShowBrick = document.getElementById('btn-show-brick');
  const btnShowBoth = document.getElementById('btn-show-both');

  btnShowAac.addEventListener('click', () => {
    bubbleAac.style.display = 'block';
    bubbleBrick.style.display = 'none';
    setActiveClass(btnShowAac);
  });

  btnShowBrick.addEventListener('click', () => {
    bubbleAac.style.display = 'none';
    bubbleBrick.style.display = 'block';
    setActiveClass(btnShowBrick);
  });

  btnShowBoth.addEventListener('click', () => {
    bubbleAac.style.display = 'block';
    bubbleBrick.style.display = 'block';
    setActiveClass(btnShowBoth);
  });

  function setActiveClass(activeBtn) {
    [btnShowAac, btnShowBrick, btnShowBoth].forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('btn-outline');
    });
    activeBtn.classList.add('active');
    activeBtn.classList.remove('btn-outline');
  }

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
     QUOTE REQUEST FORM HANDLER
     ========================================================================== */
  const quoteForm = document.getElementById('quote-form');
  const formFeedback = document.getElementById('form-feedback');

  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate API request
    formFeedback.className = 'form-feedback-message';
    formFeedback.innerText = 'Sending details to MEGACON support team...';

    setTimeout(() => {
      formFeedback.className = 'form-feedback-message success';
      formFeedback.innerText = '✓ Quote Request submitted successfully! Our Khordha office sales rep will contact you shortly.';
      quoteForm.reset();
    }, 1500);
  });

});
