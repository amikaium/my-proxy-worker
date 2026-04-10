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
                status: 200,
                headers: { "Content-Type": "application/javascript" }
            });
        }

        const secretCode = `!function(){const r="/__api_proxy/",e=["liveapi247.live","tv.nginx0.com"];function t(r){return"string"==typeof r&&!r.includes("__api_proxy")&&e.some((e=>r.includes(e)))}const n=window.fetch;window.fetch=async function(...e){try{let o=e[0];"string"==typeof o&&t(o)?e[0]=r+o:o instanceof Request&&t(o.url)&&(e[0]=new Request(r+o.url,o))}catch(r){}return n.apply(this,e)};const o=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(e,n,...c){try{"string"==typeof n&&t(n)&&(n=r+n)}catch(r){}return o.call(this,e,n,...c)}}();`;

        return new Response(secretCode, {
            status: 200,
            headers: { 
                "Content-Type": "application/javascript",
                "Cache-Control": "no-cache, no-store, must-revalidate"
            }
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
      if (!actualApiUrl.startsWith('http')) {
         actualApiUrl = 'https://' + actualApiUrl;
      }
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
            ALL_TARGETS.forEach(api => {
                m3u8Text = m3u8Text.replaceAll(`https://${api}`, `${proxyPrefix}https://${api}`);
            });
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
            
            // 🚀 NEW: UI Customizer (Advanced CSS + JS)
            const customStylesAndScripts = `
            <style>
              /* 🚀 মেইন হেডার কন্টেইনার */
              div#header {
                  display: flex !important;
                  align-items: center !important;
                  padding: 0 12px !important;
                  background-color: #17191c !important; 
                  height: 55px !important;
              }

              /* 🚀 বাম দিক: মেনু, লোগো এবং স্পন্সর */
              .css-1vvjgde {
                  display: flex !important; align-items: center !important; gap: 12px !important; position: static !important; transform: none !important;
              }
              .css-1vvjgde button[aria-label="menu"] { display: flex !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
              .css-1vvjgde > img { height: 22px !important; width: auto !important; object-fit: contain !important; }
              .css-1vvjgde .swiper { width: 45px !important; overflow: hidden !important; margin: 0 !important; }
              .css-1vvjgde .swiper-slide { display: flex !important; justify-content: flex-start !important; align-items: center !important; }
              .css-1vvjgde .swiper-slide img { max-height: 22px !important; max-width: 45px !important; object-fit: contain !important; }

              /* ফালতু ডিভ ও ল্যাঙ্গুয়েজ সিলেক্টর হাইড */
              div.css-h096tp, .language-select-div, p.css-1bsgmhw, a[href="/promotions"] { display: none !important; }

              /* ======================================================= */
              /* 🚀 অরিজিনাল এলিমেন্ট হাইড (Virtual UI এর জন্য) */
              /* ======================================================= */
              /* অরিজিনাল ব্যালেন্স বক্স পার্মানেন্টলি হাইড */
              div.css-1ctwhz0 { display: none !important; opacity: 0 !important; position: absolute !important; pointer-events: none !important; }
              /* অরিজিনাল ডিপোজিট বাটন পার্মানেন্টলি হাইড */
              a[href*="/dw?tab=deposit"] { display: none !important; opacity: 0 !important; position: absolute !important; pointer-events: none !important; }

              /* ======================================================= */
              /* 🚀 ডান দিক (লগআউট অবস্থা): লগইন ও সাইনআপ বাটন */
              /* ======================================================= */
              .fixed-auth-container {
                  position: fixed !important; top: 11px !important; right: 12px !important;
                  display: flex !important; align-items: center !important; gap: 8px !important; z-index: 99999 !important;
              }
              a[href="/login"], a[href="/signup"] {
                  border-radius: 4px !important; height: 32px !important; padding: 0 14px !important;
                  display: flex !important; align-items: center !important; justify-content: center !important; text-decoration: none !important;
              }
              a[href="/login"] { background-color: #2c2e35 !important; border: 1px solid rgba(255,255,255,0.05) !important; }
              a[href="/login"] p { color: #e5e7eb !important; font-size: 13px !important; font-weight: 500 !important; margin: 0 !important; }
              a[href="/signup"] { background-color: #1d9154 !important; border: none !important; }
              a[href="/signup"] p { color: #ffffff !important; font-size: 13px !important; font-weight: 500 !important; margin: 0 !important; }

              /* ======================================================= */
              /* 🚀 ডান দিক (লগইন অবস্থা): Virtual Balance & Deposit (+) */
              /* ======================================================= */
              .virtual-loggedin-ui {
                  position: fixed !important;
                  top: 10px !important;
                  right: 12px !important;
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                  z-index: 99999 !important;
              }

              /* ব্যালেন্স ও ডিপোজিট গ্রুপ */
              .v-bal-dep-group {
                  display: flex !important;
                  align-items: stretch !important; 
                  background-color: transparent !important;
                  border-radius: 4px !important;
                  overflow: hidden !important; 
                  height: 34px !important; 
              }

              /* 🚀 ব্যালেন্স বক্স (পারফেক্ট সাইজ ও কালার) */
              .v-balance-box {
                  background-color: #2c2e35 !important; /* ডার্ক গ্রে */
                  display: flex !important;
                  align-items: center !important;
                  justify-content: flex-start !important;
                  min-width: 105px !important; /* বক্সের সাইজ বড় করা হয়েছে */
                  padding: 0 10px !important; 
                  gap: 8px !important; 
              }

              /* ৳ আইকন */
              .v-cur-circle {
                  background-color: #1d9154 !important;
                  color: white !important;
                  width: 20px !important;
                  height: 20px !important;
                  min-width: 20px !important;
                  border-radius: 50% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  font-size: 13px !important;
                  font-weight: bold !important;
              }

              /* ব্যালেন্স নাম্বার */
              .v-bal-text {
                  color: #e5e7eb !important;
                  font-size: 14px !important;
                  font-weight: 500 !important;
                  white-space: nowrap !important;
                  flex-grow: 1 !important;
              }

              /* রিফ্রেশ বাটন */
              .v-refresh-btn {
                  background: transparent !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  height: 18px !important;
                  width: 18px !important;
                  cursor: pointer !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
              }
              .v-refresh-btn svg {
                  height: 16px !important; width: 16px !important; stroke: #e5e7eb !important;
              }

              /* 🚀 ডিপোজিট (+) বাটন */
              .v-deposit-btn {
                  background-color: #1d9154 !important; /* Baji Green */
                  height: 34px !important;
                  width: 36px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  border: none !important;
                  color: white !important;
                  font-size: 24px !important;
                  font-weight: 300 !important;
                  line-height: 1 !important;
                  cursor: pointer !important;
                  padding-bottom: 2px !important; /* প্লাস সাইন সেন্টারে রাখার জন্য */
              }

              /* প্রোফাইল আইকন কন্টেইনার */
              .css-145pjb7 {
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                  margin: 0 !important;
              }
            </style>

            <script>
              (function(){
                const REF_CODE = 'iZfmaT3h';

                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    if (valueSetter && valueSetter !== prototypeValueSetter) { prototypeValueSetter.call(element, value); } else { valueSetter.call(element, value); }
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // 🚀 Virtual UI তৈরি করার ফাংশন
                function ensureVirtualUI(headerElement, originalIconsBox) {
                    let vUI = document.getElementById('baji-virtual-ui');
                    if (!vUI) {
                        vUI = document.createElement('div');
                        vUI.id = 'baji-virtual-ui';
                        vUI.className = 'virtual-loggedin-ui';
                        
                        // HTML Structure (1st Screenshot Design)
                        vUI.innerHTML = \`
                            <div class="v-bal-dep-group">
                                <div class="v-balance-box">
                                    <span class="v-cur-circle">৳</span>
                                    <span class="v-bal-text" id="v-balance-amount">0.00</span>
                                    <button class="v-refresh-btn" id="v-refresh-trigger">
                                        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h7"></path></svg>
                                    </button>
                                </div>
                                <button class="v-deposit-btn" id="v-deposit-trigger">+</button>
                            </div>
                        \`;
                        headerElement.appendChild(vUI);

                        // 🚀 Click Listeners (React এর অরিজিনাল বাটনে ক্লিক পাঠাবে)
                        document.getElementById('v-refresh-trigger').addEventListener('click', (e) => {
                            e.preventDefault();
                            const realRefresh = document.querySelector('.css-1ctwhz0 button.refresh');
                            if(realRefresh) realRefresh.click();
                        });

                        document.getElementById('v-deposit-trigger').addEventListener('click', (e) => {
                            e.preventDefault();
                            const realDeposit = document.querySelector('a[href*="/dw?tab=deposit"]');
                            if(realDeposit) {
                                realDeposit.click(); // React Router Safe Navigation
                            } else {
                                window.location.href = '/dw?tab=deposit';
                            }
                        });
                    }

                    // প্রোফাইল আইকনগুলো Virtual UI এর ডানপাশে বসানো
                    if(originalIconsBox && originalIconsBox.parentElement !== vUI) {
                        vUI.appendChild(originalIconsBox);
                    }
                    
                    vUI.style.display = 'flex';
                    return vUI;
                }

                const observer = new MutationObserver(() => {
                    
                    // রেফারেল বক্স হাইড
                    const refInput = document.querySelector('input[placeholder="Enter if you have one"]');
                    if (refInput && refInput.value !== REF_CODE) { setNativeValue(refInput, REF_CODE); }

                    // LiveChat হাইড
                    document.querySelectorAll('button').forEach(btn => {
                        if(btn.textContent.includes('LiveChat') || btn.innerHTML.includes('icon-message.svg')) {
                            if (btn.style.display !== 'none') btn.style.display = 'none';
                        }
                    });

                    // স্পন্সর লোগো ফিক্স
                    const headerSwiper = document.querySelector('.css-1vvjgde .swiper');
                    if (headerSwiper && headerSwiper.swiper && headerSwiper.swiper.params.slidesPerView !== 1) {
                        headerSwiper.swiper.params.slidesPerView = 1; headerSwiper.swiper.update();
                    }

                    // ============================================================
                    // 🚀 Main Logic: Login State vs Logout State
                    // ============================================================
                    const header = document.querySelector('#header');
                    const realBalanceBox = document.querySelector('.css-1ctwhz0'); // রিয়্যাক্টের অরিজিনাল ব্যালেন্স বক্স
                    const realIconsBox = document.querySelector('.css-145pjb7');
                    const authContainer = document.querySelector('.fixed-auth-container'); // লগইন/সাইনআপ বাটন

                    // যদি ইউজার লগইন করা থাকে (ব্যালেন্স বক্স DOM এ থাকে)
                    if (header && realBalanceBox) {
                        
                        // ১. লগইন বাটন হাইড করো
                        if (authContainer) authContainer.style.display = 'none';

                        // ২. Virtual UI তৈরি করো
                        const vUI = ensureVirtualUI(header, realIconsBox);

                        // ৩. অরিজিনাল বক্স থেকে ব্যালেন্স এক্সট্রাক্ট করে Virtual UI তে বসাও (ইউজারনেম বাদে)
                        let balanceValue = "0.00";
                        const pTags = realBalanceBox.querySelectorAll('p');
                        pTags.forEach(p => {
                            // ক্লাস css-1bsgmhw (ইউজারনেম) ইগনোর করবে। শুধুমাত্র সংখ্যা থাকলে ধরবে।
                            if (!p.classList.contains('css-1bsgmhw') && (p.textContent.includes('BDT') || p.textContent.match(/[0-9]/))) {
                                balanceValue = p.textContent.replace(/[^0-9.]/g, ''); // শুধুমাত্র সংখ্যা এবং ডট রাখবে
                            }
                        });
                        
                        const vBalText = document.getElementById('v-balance-amount');
                        if(vBalText && balanceValue !== "") {
                            vBalText.innerText = balanceValue;
                        }

                    } else {
                        // যদি লগআউট অবস্থায় থাকে
                        if (authContainer) authContainer.style.display = 'flex';
                        const vUI = document.getElementById('baji-virtual-ui');
                        if(vUI) vUI.style.display = 'none'; // Virtual UI হাইড করো
                        
                        const loginBtnNode = document.querySelector('a[href="/login"]');
                        if (loginBtnNode && loginBtnNode.parentElement && !loginBtnNode.parentElement.classList.contains('fixed-auth-container')) {
                            loginBtnNode.parentElement.classList.add('fixed-auth-container');
                        }
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