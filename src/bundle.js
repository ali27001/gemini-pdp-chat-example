// PDP Assistant Bundle - Console snippet for Gengage challenge
(async function initPDPAssistant() {
  console.log('🚀 PDP Assistant loading...');

  // 1. Check Gemini Nano availability
  async function checkGeminiNano() {
    // Check for new LanguageModel API (Chrome 150+)
    if ('LanguageModel' in window) {
      try {
        const availability = await window.LanguageModel.canCreateTextSession();
        return { available: availability === 'readily-available' || availability === 'after-download', reason: availability === 'readily-available' ? 'Ready' : 'Model downloading...' };
      } catch (e) {
        return { available: false, reason: e.message };
      }
    }
    
    // Fallback to old window.ai API (Chrome 126-149)
    if ('ai' in window) {
      try {
        const available = await window.ai.canCreateTextSession();
        return { available, reason: available ? 'Ready' : 'Model not downloaded yet' };
      } catch (e) {
        return { available: false, reason: e.message };
      }
    }
    
    return { available: false, reason: 'AI API not available in this browser' };
  }

  // 2. Extract product facts from PDP (Koctas optimized)
  function extractProductFacts() {
    const facts = {
      title: '',
      brand: '',
      price: '',
      category: '',
      description: '',
      images: [],
      specifications: [],
      colors: [],
      sizes: [],
      materials: [],
      storage: false,
      capacity: '',
      freeShipping: false,
    };

    // Extract title - Koctas specific
    let titleEl = document.querySelector('.prd-title strong');
    if (!titleEl) titleEl = document.querySelector('h1');
    if (titleEl) {
      facts.title = titleEl.parentElement?.textContent.trim() || titleEl.textContent.trim();
    }

    // Extract brand from title (e.g., "Evdemo Serra 3 Kişilik...")
    const titleMatch = facts.title.match(/^(\w+)\s+(.+)/);
    if (titleMatch) {
      facts.brand = titleMatch[1];
    }

    // Extract price - Koctas format
    const priceEl = document.querySelector('.prd-price-last');
    if (priceEl) {
      facts.price = priceEl.textContent.trim();
    }

    // Extract category info from hidden fields
    const perCat = document.querySelector('.perCat');
    const perCat1 = document.querySelector('.perCat1');
    const perCat2 = document.querySelector('.perCat2');
    if (perCat) facts.category = perCat.textContent.trim();
    const categories = [perCat?.textContent, perCat1?.textContent, perCat2?.textContent].filter(Boolean);

    // Extract free shipping info
    const kargoBedavaEl = document.querySelector('.prd-badge2');
    if (kargoBedavaEl && kargoBedavaEl.textContent.includes('Bedava')) {
      facts.freeShipping = true;
    }

    // Extract product images
    const imgEls = document.querySelectorAll('img[alt*="Kanepe"], img[alt*="Mobilya"], .prd-media img, img[class*="item_img"]');
    facts.images = Array.from(imgEls)
      .slice(0, 5)
      .map(img => img.src || img.dataset.src || img.dataset.srcset)
      .filter(src => src && src.length > 10 && src.includes('koctas-img'));

    // Get all visible text for analysis
    const mainContent = document.body.innerText;

    // Extract specs from visible text
    const lines = mainContent.split('\n')
      .filter(line => {
        const t = line.trim();
        return t.length > 5 && t.length < 250 && !t.includes('javascript') && !t.includes('Kargo');
      })
      .slice(0, 30);
    facts.specifications = lines;

    // Look for colors (Turkish + English)
    const colorPatterns = 'black|kara|siyah|white|beyaz|gray|grey|gri|krem|red|kırmızı|blue|mavi|green|yeşil|brown|kahverengi|füme|lacivert|navy|antrasit|bordo|turkuaz';
    const colorMatches = mainContent.match(new RegExp(`\\b(${colorPatterns})\\b`, 'gi'));
    if (colorMatches) {
      facts.colors = [...new Set(colorMatches.map(c => c.toLowerCase()))].slice(0, 8);
    }

    // Look for seater/kişilik info
    const seaterMatch = mainContent.match(/(\\d+)\\s*(?:kişilik|seater|person|oturan)/i);
    if (seaterMatch) {
      facts.capacity = seaterMatch[0];
    }

    // Look for materials
    const materialPatterns = 'kumaş|polyester|metal|ahşap|wood|leather|deri|velvet|kadife|ipek|pamuk|cotton';
    const materialMatches = mainContent.match(new RegExp(`\\b(${materialPatterns})\\b`, 'gi'));
    if (materialMatches) {
      facts.materials = [...new Set(materialMatches.map(m => m.toLowerCase()))].slice(0, 6);
    }

    // Check for storage/sandık/çekmece
    facts.storage = /sandık|çekmece|storage|drawer|depolama|raf|kabin/i.test(mainContent);

    return facts;
  }

  // 3. Initialize Gemini Nano session
  async function initializeGemini() {
    try {
      // Try new LanguageModel API first
      if ('LanguageModel' in window) {
        const session = await window.LanguageModel.create({
          topK: 40,
          temperature: 0.8,
        });
        return session;
      }
      
      // Fallback to old window.ai API
      if ('ai' in window) {
        const session = await window.ai.createTextSession({
          topK: 40,
          temperature: 0.8,
        });
        return session;
      }
      
      return null;
    } catch (e) {
      console.error('Failed to initialize Gemini Nano:', e);
      return null;
    }
  }

  // 4. Generate answer using Gemini Nano
  async function generateAnswer(session, productFacts, question) {
    const specs = productFacts.specifications.slice(0, 10).join('\n- ');
    const productContext = `ÜRÜN BİLGİLERİ:
Marka: ${productFacts.brand || 'Belirtilmemiş'}
Başlık: ${productFacts.title}
Fiyat: ${productFacts.price}
Kategori: ${productFacts.category}
Kargo: ${productFacts.freeShipping ? 'Ücretsiz' : 'Ücretli'}

Renkler: ${productFacts.colors.length > 0 ? productFacts.colors.join(', ') : 'Belirtilmemiş'}
Malzeme: ${productFacts.materials.length > 0 ? productFacts.materials.join(', ') : 'Belirtilmemiş'}
Kapasitesi/Kişilik: ${productFacts.capacity || 'Belirtilmemiş'}
Sandık/Depolama: ${productFacts.storage ? 'Evet' : 'Hayır'}

SAYFA ÜZERİNDE GÖRÜNEN BİLGİLER:
- ${specs}

KURALLAR:
1. SADECE yukarıdaki ürün bilgilerine dayanarak cevap ver
2. Sayfada yazılı olmayan bilgiyi asla uydurmayın
3. Eğer bilgi yoksa "Bu bilgi ürün sayfasında yer almamaktadır" de
4. Kısa ve açık cevap ver (maksimum 2-3 cümle)
5. Turkish kullan`;

    const prompt = `Sen bir e-commerce ürün asistanısın. Müşteri sorusuna SADECE verilen ürün bilgisine dayanarak cevap ver.

${productContext}

Müşteri Sorusu: ${question}

Cevap:`;

    try {
      let fullResponse = '';
      const stream = await session.promptStreaming(prompt);

      for await (const chunk of stream) {
        fullResponse += chunk;
      }

      return fullResponse.trim() || 'Cevap üretilemedi';
    } catch (e) {
      return `Hata: ${e.message}`;
    }
  }

  // 5. Create UI Widget
  function createUI(productFacts, session, geminiStatus) {
    const existing = document.getElementById('pdp-assistant-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'pdp-assistant-container';
    
    const widget = document.createElement('div');
    widget.id = 'pdp-assistant';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      background: white;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      z-index: 999999;
      overflow: hidden;
    `;

    widget.innerHTML = `
      <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Product Assistant</h3>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9;">Ask about this product</p>
        </div>
        <button id="close-assistant" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 20px; cursor: pointer; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">×</button>
      </div>

      ${!geminiStatus.available ? `<div style="padding: 12px 16px; background: #fff3cd; border-bottom: 1px solid #ffc107; font-size: 12px; color: #856404; line-height: 1.4;"><strong>⚠️ Note:</strong> Gemini Nano - ${geminiStatus.reason}</div>` : ''}

      <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f9f9f9;">
        <div style="padding: 12px; background: white; border-radius: 8px; font-size: 13px; line-height: 1.4; border-left: 3px solid #667eea;">
          <strong>Hello! 👋</strong><br>I can answer questions about this product based on what's visible on the page.
        </div>
      </div>

      <div style="padding: 12px 16px; border-top: 1px solid #e5e5e5; background: white; display: flex; gap: 8px;">
        <input id="question-input" type="text" placeholder="Ask me anything..." style="flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; outline: none; transition: border-color 0.2s;" ${!geminiStatus.available ? 'disabled' : ''} />
        <button id="send-btn" style="padding: 10px 16px; background: ${geminiStatus.available ? '#667eea' : '#ccc'}; color: white; border: none; border-radius: 6px; cursor: ${geminiStatus.available ? 'pointer' : 'not-allowed'}; font-size: 13px; font-weight: 600; transition: background 0.2s;">Send</button>
      </div>
    `;

    container.appendChild(widget);
    document.body.appendChild(container);

    const messagesDiv = document.getElementById('chat-messages');
    const input = document.getElementById('question-input');
    const sendBtn = document.getElementById('send-btn');
    const closeBtn = document.getElementById('close-assistant');

    const handleSend = async () => {
      const question = input.value.trim();
      if (!question || !session) return;

      input.value = '';

      const userMsg = document.createElement('div');
      userMsg.style.cssText = 'padding: 10px 12px; background: #667eea; color: white; border-radius: 8px; font-size: 13px; align-self: flex-end; max-width: 85%; word-wrap: break-word;';
      userMsg.textContent = question;
      messagesDiv.appendChild(userMsg);

      const loadingMsg = document.createElement('div');
      loadingMsg.style.cssText = 'padding: 10px 12px; background: white; border-radius: 8px; font-size: 13px; border-left: 3px solid #667eea;';
      loadingMsg.innerHTML = '⏳ <em>Thinking...</em>';
      messagesDiv.appendChild(loadingMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      const answer = await generateAnswer(session, productFacts, question);

      loadingMsg.remove();

      const assistantMsg = document.createElement('div');
      assistantMsg.style.cssText = 'padding: 10px 12px; background: white; border-radius: 8px; font-size: 13px; line-height: 1.5; border-left: 3px solid #667eea;';
      assistantMsg.textContent = answer;
      messagesDiv.appendChild(assistantMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '#667eea';
      input.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = '#ddd';
      input.style.boxShadow = 'none';
    });

    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.3)';
    });
    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.2)';
    });

    closeBtn.addEventListener('click', () => {
      container.remove();
    });
  }

  // 6. Main initialization
  try {
    console.log('✓ Checking Gemini Nano availability...');
    const geminiStatus = await checkGeminiNano();
    console.log('Gemini Status:', geminiStatus);

    console.log('✓ Extracting product facts...');
    const productFacts = extractProductFacts();
    console.log('Product Facts:', productFacts);

    let session = null;
    if (geminiStatus.available) {
      console.log('✓ Initializing Gemini Nano session...');
      session = await initializeGemini();
      if (!session) {
        console.warn('⚠️ Failed to create Gemini session');
      } else {
        console.log('✓ Gemini Nano session ready');
      }
    }

    console.log('✓ Creating UI...');
    createUI(productFacts, session, geminiStatus);
    console.log('✅ PDP Assistant loaded successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize PDP Assistant:', error);
  }
})();
