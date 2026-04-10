export default {
  async fetch(request, env, ctx) {
    // ==========================================
    // ⚙️ ইউজার কনফিগারেশন সেকশন (Baji11 Live)
    // ==========================================
    
    const TARGET_DOMAIN = env.TARGET_URL || "https://www.baji11.live";
    const API_DOMAINS = ["liveapi247.live"]; 
    const MEDIA_AND_SCORE_DOMAINS = ["tv.nginx0.com"]; 
    
    const ALL_TARGETS = [...API_DOMAINS, ...MEDIA_AND_SCORE_DOMAINS]; 
    const url = new URL(request.url);
    const originHeader = request.headers.get("Origin") || `https://${url.host}`;

    // 🛡️ প্রফেশনাল সিকিউরিটি: Ghost Script Route
    if (url.pathname === '/__secure_core.js') {
        const referer = request.headers.get("Referer");
        if (!referer || !referer.includes(url.hostname)) {
            return new Response(`console.log("Access Denied: Highly Secured Proxy System 😎");`, {
                status: 200, headers: { "Content-Type": "application/javascript" }
            });
        }
        const secretCode = `!function(){const r="/__api_proxy/",e=["liveapi247.live","tv.nginx0.com"];function t(r){return"string"==typeof r&&!r.includes("__api_proxy")&&e.some((e=>r.includes(e)))}const n=window.fetch;window.fetch=async function(...e){try{let o=e[0];"string"==typeof o&&t(o)?e[0]=r+o:o instanceof Request&&t(o.url)&&(e[0]=new Request(r+o.url,o))}catch(r){}return n.apply(this,e)};const o=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(e,n,...c){try{"string"==typeof n&&t(n)&&(n=r+n)}catch(r){}return o.call(this,e,n,...c)}}();`;
        return new Response(secretCode, {
            status: 200, headers: { "Content-Type": "application/javascript", "Cache-Control": "no-cache, no-store, must-revalidate" }
        });
    }

    // ১. CORS প্রিফ্লাইট
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": originHeader,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }
      });
    }

    // ২. API এবং Video Stream (m3u8/ts) প্রক্সি
    if (url.pathname.startsWith('/__api_proxy/')) {
      let actualApiUrl = request.url.substring(request.url.indexOf('/__api_proxy/') + 13);
      if (!actualApiUrl.startsWith('http')) actualApiUrl = 'https://' + actualApiUrl;
      try {
        const targetApi = new URL(actualApiUrl);
        const apiReq = new Request(targetApi.toString(), request);
        apiReq.headers.set("Host", targetApi.host);
        apiReq.headers.set("Origin", TARGET_DOMAIN);
        apiReq.headers.set("Referer", TARGET_DOMAIN + "/");

        const apiRes = await fetch(apiReq);
        let newApiRes;
        const contentType = apiRes.headers.get("content-type") || "";
        
        if (contentType.includes("mpegurl") || contentType.includes("m3u8") || url.pathname.endsWith(".m3u8")) {
            let m3u8Text = await apiRes.text();
            const proxyPrefix = `https://${url.host}/__api_proxy/`;
            ALL_TARGETS.forEach(api => { m3u8Text = m3u8Text.replaceAll(`https://${api}`, `${proxyPrefix}https://${api}`); });
            const modHeaders = new Headers(apiRes.headers);
            modHeaders.delete("content-length"); 
            newApiRes = new Response(m3u8Text, { status: apiRes.status, statusText: apiRes.statusText, headers: modHeaders });
        } else {
            newApiRes = new Response(apiRes.body, apiRes);
        }
        
        const finalHeaders = new Headers(newApiRes.headers);
        finalHeaders.set("Access-Control-Allow-Origin", originHeader);
        finalHeaders.set("Access-Control-Allow-Credentials", "true");
        return new Response(newApiRes.body, { status: newApiRes.status, statusText: newApiRes.statusText, headers: finalHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Proxy Error" }), { status: 500 });
      }
    }

    // ৩. মেইন ওয়েবসাইট লোড করা
    const target = new URL(TARGET_DOMAIN);
    target.pathname = url.pathname;
    target.search = url.search;
    const proxyRequest = new Request(target.toString(), request);
    proxyRequest.headers.set("Host", target.hostname);
    proxyRequest.headers.set("Origin", target.origin);
    proxyRequest.headers.set("Referer", target.origin);
    proxyRequest.headers.delete("Accept-Encoding"); 

    try {
      const response = await fetch(proxyRequest);
      const contentType = response.headers.get("content-type") || "";
      let responseBody;
      const newResponseHeaders = new Headers(response.headers);

      if (contentType.includes("text/html") || contentType.includes("application/javascript") || contentType.includes("text/javascript")) {
        let text = await response.text();
        const proxyPrefix = `https://${url.host}/__api_proxy/`;
        
        MEDIA_AND_SCORE_DOMAINS.forEach(api => {
            const originalUrl = `https://${api}`;
            const proxyUrl = `${proxyPrefix}${originalUrl}`;
            text = text.replaceAll(originalUrl, proxyUrl);
            text = text.replaceAll(originalUrl.replace(/\//g, '\\/'), proxyUrl.replace(/\//g, '\\/'));
        });

        if (contentType.includes("text/html")) {
            
            // 🚀 NEW: UI Customizer (Strictly Scoped CSS)
            const customStylesAndScripts = `
            <style>
              /* ==========================================
                 🚫 সাদা বক্স এবং ফালতু এলিমেন্ট হাইড
                 ========================================== */
              div.css-h096tp, 
              .language-select-div { 
                  display: none !important; 
              }

              /* ==========================================
                 🚀 হেডার ডিজাইন 
                 ========================================== */
              div#header {
                  display: flex !important; align-items: center !important; padding: 0 12px !important;
                  background-color: #17191c !important; height: 55px !important; z-index: 1000 !important;
              }
              .css-1vvjgde { display: flex !important; align-items: center !important; gap: 12px !important; }
              .css-1vvjgde button[aria-label="menu"] { display: flex !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
              .css-1vvjgde > img { height: 22px !important; width: auto !important; object-fit: contain !important; }
              .css-1vvjgde .swiper { width: 45px !important; overflow: hidden !important; margin: 0 !important; }
              .css-1vvjgde .swiper-slide { display: flex !important; justify-content: flex-start !important; align-items: center !important; }
              .css-1vvjgde .swiper-slide img { max-height: 22px !important; max-width: 45px !important; object-fit: contain !important; }

              /* লগইন/সাইনআপ বাটন ডিজাইন */
              a[href="/login"], a[href="/signup"] {
                  border-radius: 4px !important; height: 32px !important; padding: 0 14px !important;
                  display: flex !important; align-items: center !important; justify-content: center !important; text-decoration: none !important;
              }
              a[href="/login"] { background-color: #2c2e35 !important; border: 1px solid rgba(255,255,255,0.05) !important; }
              a[href="/login"] p { color: #e5e7eb !important; font-size: 13px !important; margin: 0 !important; }
              a[href="/signup"] { background-color: #1d9154 !important; border: none !important; }
              a[href="/signup"] p { color: #ffffff !important; font-size: 13px !important; margin: 0 !important; }


              /* ==========================================
                 💎 কাস্টম ড্যাশবোর্ড প্যানেল (Perfect Height & Highlights)
                 ========================================== */

              /* 🚀 মেইন কন্টেইনার */
              div.css-1rfmqpc {
                  display: flex !important;
                  flex-direction: row !important;
                  justify-content: space-between !important;
                  align-items: stretch !important;
                  padding: 8px 12px !important; /* হাইট কমানো হলো */
                  gap: 10px !important;
                  background-color: #121418 !important; 
                  width: 100% !important;
                  box-sizing: border-box !important;
              }

              /* 📦 Box 1: ইউজারনেম এবং ব্যালেন্স */
              div.css-1rfmqpc > div.css-1ctwhz0 {
                  flex: 1.1 !important;
                  background: linear-gradient(135deg, #2b2f3a 0%, #1a1d24 100%) !important; /* কালার হাইলাইট */
                  border: 1px solid rgba(254, 172, 4, 0.4) !important; /* গোল্ডেন বর্ডার */
                  border-radius: 8px !important;
                  padding: 8px 12px !important; /* হাইট কমানো হলো */
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: center !important;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
                  position: relative !important;
                  border-right: 1px solid rgba(254, 172, 4, 0.4) !important; /* ফিক্সড বর্ডার */
              }

              /* Username Text */
              div.css-1rfmqpc > div.css-1ctwhz0 > p.css-1bsgmhw {
                  color: #e5e7eb !important;
                  font-size: 12px !important;
                  font-weight: 600 !important;
                  margin: 0 0 2px 0 !important; /* গ্যাপ কমানো হলো */
                  letter-spacing: 0.5px !important;
              }

              /* BDT Balance */
              div.css-1rfmqpc > div.css-1ctwhz0 > p.css-0 {
                  color: #FEAC04 !important; 
                  font-size: 15px !important;
                  font-weight: 700 !important;
                  margin: 0 !important;
              }

              /* 🚀 অরিজিনাল Refresh Icon ফিক্স */
              div.css-1rfmqpc > div.css-1ctwhz0 > button {
                  position: absolute !important;
                  right: 12px !important;
                  top: 50% !important; /* একেবারে মাঝখানে */
                  transform: translateY(-50%) !important;
                  color: #FEAC04 !important; /* অরিজিনাল স্ট্রোকের কালার */
                  background: transparent !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  min-width: auto !important;
                  height: auto !important;
                  transition: transform 0.3s !important;
              }
              div.css-1rfmqpc > div.css-1ctwhz0 > button svg {
                  fill: none !important; /* Fill রিমুভ, অরিজিনাল স্ট্রোক থাকবে */
                  stroke: currentColor !important;
                  width: 18px !important;
                  height: 18px !important;
              }
              div.css-1rfmqpc > div.css-1ctwhz0 > button:active { 
                  transform: translateY(-50%) rotate(180deg) !important; 
              }


              /* 📦 Box 2: প্রমোশন এবং ডিপোজিট কন্টেইনার */
              div.css-1rfmqpc > div.css-145pjb7 {
                  flex: 0.9 !important;
                  display: flex !important;
                  gap: 8px !important;
                  justify-content: space-between !important;
                  align-items: stretch !important;
                  border: none !important; 
                  padding: 0 !important;
              }
              div.css-1rfmqpc > div.css-145pjb7::before, 
              div.css-1rfmqpc > div.css-145pjb7::after { 
                  display: none !important; 
              }

              /* 🚫 প্রমোশন বাটন পুরোপুরি হাইড */
              div.css-1rfmqpc > div.css-145pjb7 > a[href="/promotions"] {
                  display: none !important;
              }

              /* 💰 Deposit/Withdraw বাটনকে ফুল উইডথ করা */
              div.css-1rfmqpc > div.css-145pjb7 > a[href*="deposit"] {
                  flex: 1 !important;
                  width: 100% !important;
                  background: linear-gradient(135deg, #2b2f3a 0%, #1a1d24 100%) !important; /* কালার হাইলাইট */
                  border: 1px solid rgba(254, 172, 4, 0.5) !important; /* ক্লিয়ার গোল্ডেন বর্ডার */
                  border-radius: 8px !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                  justify-content: center !important;
                  padding: 6px 4px !important; /* হাইট কমানো হলো */
                  text-decoration: none !important;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
              }

              div.css-1rfmqpc > div.css-145pjb7 > a[href*="deposit"] svg {
                  margin-bottom: 2px !important;
                  width: 18px !important;
                  height: 18px !important;
              }

              div.css-1rfmqpc > div.css-145pjb7 > a[href*="deposit"] * {
                  color: #FEAC04 !important;
                  font-weight: 600 !important;
                  font-size: 11px !important;
                  margin: 0 !important;
              }

              /* ইনপুট বক্স ডিজাইন */
              input.chakra-input, .chakra-input {
                  border-radius: 8px !important; height: 50px !important; 
                  background-color: rgba(255, 255, 255, 0.08) !important; 
                  border: 1px solid rgba(255, 255, 255, 0.1) !important; color: white !important;
              }
            </style>

            <script>
              (function(){
                const REF_CODE = 'iZfmaT3h';

                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, value);
                    else valueSetter.call(element, value);
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                const observer = new MutationObserver(() => {
                    
                    // রেফারেল কোড অটো-ফিল
                    const refInput = document.querySelector('input[placeholder="Enter if you have one"]');
                    if (refInput) {
                        if (refInput.value !== REF_CODE) setNativeValue(refInput, REF_CODE);
                        const parentGroup = refInput.closest('.chakra-form-control');
                        if (parentGroup && parentGroup.style.display !== 'none') parentGroup.style.display = 'none';
                    }

                    // লাইভ চ্যাট হাইড
                    document.querySelectorAll('button').forEach(btn => {
                        if(btn.textContent.includes('LiveChat') || btn.innerHTML.includes('icon-message.svg')) {
                            if (btn.style.display !== 'none') btn.style.display = 'none';
                        }
                    });

                    // 🚀 লগইন ও সাইনআপ বাটন ফিক্সড করা
                    const loginBtnNode = document.querySelector('a[href="/login"]');
                    if (loginBtnNode && loginBtnNode.parentElement) {
                        loginBtnNode.parentElement.setAttribute(
                            'style', 
                            'position: fixed !important; top: 11px !important; right: 12px !important; display: flex !important; align-items: center !important; gap: 8px !important; z-index: 99999 !important; width: auto !important; background: transparent !important;'
                        );
                    }

                    // 🚀 Deposit লেখাকে পরিবর্তন করে "Deposit/Withdraw" করা
                    const depositTextNodes = document.querySelectorAll('a[href*="deposit"] p, a[href*="deposit"] span, a[href*="deposit"] div');
                    depositTextNodes.forEach(node => {
                        if (node.textContent.trim() === 'Deposit') {
                            node.textContent = 'Deposit/Withdraw';
                        }
                    });

                    // স্পন্সর লোগো স্লাইডার
                    const headerSwiper = document.querySelector('.css-1vvjgde .swiper');
                    if (headerSwiper && headerSwiper.swiper && headerSwiper.swiper.params.slidesPerView !== 1) {
                        headerSwiper.swiper.params.slidesPerView = 1;
                        headerSwiper.swiper.update();
                    }
                });

                window.addEventListener('load', () => {
                    observer.observe(document.body, { childList: true, subtree: true });
                });
              })();
            </script>`;

            const ghostScriptTag = `<script src="/__secure_core.js"></script>`;
            if (text.includes('<head>')) {
              text = text.replace('<head>', '<head>' + ghostScriptTag + customStylesAndScripts);
            } else {
              text = ghostScriptTag + customStylesAndScripts + text;
            }
        }
        
        responseBody = text;
        newResponseHeaders.delete("content-length"); 
        newResponseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
      } else {
        responseBody = response.body;
      }

      newResponseHeaders.delete("Content-Security-Policy");
      newResponseHeaders.delete("X-Frame-Options");
      newResponseHeaders.set("Access-Control-Allow-Origin", originHeader);
      
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: newResponseHeaders
      });
    } catch (error) {
      return new Response("System Error", { status: 500 });
    }
  }
};
