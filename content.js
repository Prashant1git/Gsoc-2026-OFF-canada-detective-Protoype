// content.js
console.log("🕵️ OFF Detective extension loaded on this page!");

function extractProductSchema() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    let productData = null;
    scripts.forEach(script => {
        try {
            const json = JSON.parse(script.innerText);
            const schemas = Array.isArray(json) ? json : (json['@graph'] || [json]);
            schemas.forEach(schema => {
                if (schema['@type'] === 'Product') {
                    productData = {
                        name: schema.name || '',
                        brand: schema.brand ? (schema.brand.name || schema.brand) : '',
                    };
                }
            });
        } catch (e) {}
    });
    return productData;
}

function injectUpgradedBadge(productData) {
  const oldBadge = document.getElementById('off-upgraded-badge');
  if (oldBadge) oldBadge.remove();

  const host = document.createElement('div');
  host.id = 'off-upgraded-badge';
  const shadowRoot = host.attachShadow({ mode: 'open' });

  shadowRoot.innerHTML = `
    <style>
      .off-card {
        position: fixed;
        bottom: 30px;
        right: 30px;
        display: flex;
        flex-direction: column; /* Changed to column to allow expansion */
        background: #ffffff;
        border: 2px solid #e5e7eb;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 12px 18px;
        font-family: 'Public Sans', Arial, sans-serif;
        z-index: 999999;
        cursor: grab;
        user-select: none;
        width: max-content;
        max-width: 280px;
      }
      .off-card:active { cursor: grabbing; }
      
      .header-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      .score-circle {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        font-weight: 900;
        color: white;
        font-size: 22px;
        background-color: #9ca3af; 
        flex-shrink: 0;
      }
      .score-A { background-color: #038141; }
      .score-B { background-color: #85bb2f; }
      .score-C { background-color: #fecb02; }
      .score-D { background-color: #ee8100; }
      .score-E { background-color: #e63e11; }
      .score-UNKNOWN { font-size: 11px; }
      
      .details { display: flex; flex-direction: column; }
      .title { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
      .off-link { font-size: 14px; font-weight: bold; color: #0050a0; text-decoration: none; cursor: pointer; }
      .off-link:hover { text-decoration: underline; }
      
      /* --- NEW: EXPANDED SECTION CSS --- */
      .expanded-content {
        display: none; /* Hidden by default */
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        font-size: 13px;
        color: #374151;
        line-height: 1.4;
      }
      .off-card.expanded .expanded-content {
        display: block; /* Shows when expanded class is added */
      }
      .nova-badge {
        display: inline-block;
        background: #4b5563;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 6px;
        margin-bottom: 8px;
      }
      .external-link { color: #0050a0; text-decoration: none; font-weight: bold; font-size: 12px; display: block; }
      .external-link:hover { text-decoration: underline; }
    </style>

    <div class="off-card" id="draggable-card">
      <div class="header-row">
        <div class="score-circle score-${productData.nutriScore}">
          ${productData.nutriScore}
        </div>
        <div class="details">
          <span class="title">Open Food Facts Canada</span>
          <span class="off-link" id="expand-btn">View full details ▾</span>
        </div>
      </div>
      
      <div class="expanded-content">
        <strong>${productData.brand}</strong><br/>
        ${productData.name}<br/>
        <span class="nova-badge">NOVA: ${productData.nova}</span><br/>
        <a href="${productData.offLink}" target="_blank" class="external-link">View on OFF Website ↗</a>
      </div>
    </div>
  `;

  document.body.appendChild(host);

  const card = shadowRoot.getElementById('draggable-card');
  const expandBtn = shadowRoot.getElementById('expand-btn');
  
  // --- NEW: Toggle the expand card logic ---
  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Stops the drag action from triggering
    card.classList.toggle('expanded');
    // Change the text arrow based on state
    expandBtn.innerText = card.classList.contains('expanded') ? 'Hide details ▴' : 'View full details ▾';
  });

  // --- DRAG LOGIC (Preserved) ---
  let isDragging = false;
  let offsetX, offsetY;

  card.addEventListener('mousedown', (e) => {
    // Ignore drag if clicking the expand button or the external link
    if (e.target === expandBtn || e.target.tagName.toLowerCase() === 'a') return;
    
    isDragging = true;
    offsetX = e.clientX - card.getBoundingClientRect().left;
    offsetY = e.clientY - card.getBoundingClientRect().top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    card.style.bottom = 'auto';
    card.style.right = 'auto';
    card.style.left = `${e.clientX - offsetX}px`;
    card.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function searchOpenFoodFacts(product) {
    if (!product || (!product.name)) return;
    
    let cleanName = product.name.split(',')[0].replace(/Family Size|Format Familial|[0-9]+g/gi, '').trim();
    const query1 = `${product.brand} ${cleanName}`.trim();
    const query2 = `${product.brand} ${cleanName.split(' ').slice(0, 3).join(' ')}`.trim();
    const query3 = product.brand || "Nutella"; // PASS 3: The Silver Bullet (Brand Only)
    
    console.log(`🔍 Search Pass 1: "${query1}"`);
    
    chrome.runtime.sendMessage({ action: "searchOFF", query: query1 }, (res1) => {
        if (isValidMatch(res1)) return handleSuccessfulMatch(res1.data.products, query1);
        
        console.log(`⚠️ Pass 1 failed. Triggering Pass 2: "${query2}"...`);
        chrome.runtime.sendMessage({ action: "searchOFF", query: query2 }, (res2) => {
            if (isValidMatch(res2)) return handleSuccessfulMatch(res2.data.products, query2);
            
            console.log(`⚠️ Pass 2 failed. Triggering Pass 3 (Brand Only): "${query3}"...`);
            chrome.runtime.sendMessage({ action: "searchOFF", query: query3 }, (res3) => {
                if (isValidMatch(res3)) return handleSuccessfulMatch(res3.data.products, query3);
                
                console.log("❌ All passes failed. Injecting UNKNOWN.");
                injectUpgradedBadge({
                    nutriScore: 'UNKNOWN',
                    nova: '?',
                    brand: product.brand || 'Unknown',
                    name: cleanName,
                    offLink: `https://ca.openfoodfacts.org`
                }); 
            });
        });
    });
}

// Helper: Only accepts the API response if it ACTUALLY contains a Nutri-Score!
function isValidMatch(response) {
    return response && response.success && response.data.products && response.data.products.find(p => p.nutriscore_grade);
}

// Helper: Injects the UI with the best valid data
function handleSuccessfulMatch(products, fallbackName) {
    // Find the first product that actually has a Nutri-Score
    const bestMatch = products.find(p => p.nutriscore_grade) || products[0]; 
    const score = bestMatch.nutriscore_grade ? bestMatch.nutriscore_grade.toUpperCase() : 'UNKNOWN';
    
    console.log("✅ Match found!", score);
    injectUpgradedBadge({
        nutriScore: score,
        nova: bestMatch.nova_group || '?',         
        brand: bestMatch.brands || 'Unknown Brand',
        name: bestMatch.product_name || fallbackName, 
        offLink: bestMatch.url || `https://ca.openfoodfacts.org`
    });
}

setTimeout(() => {
    const hiddenData = extractProductSchema();
    if (hiddenData) searchOpenFoodFacts(hiddenData);
}, 2500);