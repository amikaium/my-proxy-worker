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
            
            // 🚀 NEW: UI Customizer (Advanced CSS + JS) - Exact Match to Screenshot
            const customStylesAndScripts = `
            <style>
              /* 🚀 মেইন হেডার কন্টেইনার ফিক্স (Flexbox Control) */
              div#header {
                  display: flex !important;
                  justify-content: space-between !important;
                  align-items: center !important;
                  padding: 0 12px !important;
                  background-color: #17191c !important; /* অরিজিনাল ডার্ক ব্যাকগ্রাউন্ড */
                  height: 55px !important;
              }

              /* 🚀 বাম দিক: লোগো এবং স্পন্সর */
              .css-1vvjgde {
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                  position: static !important; /* আগের সব পজিশন বাতিল */
                  transform: none !important;
              }

              /* বাম দিকের ফালতু হ্যামবার্গার মেনু হাইড (স্ক্রিনশটে নেই) */
              .css-1vvjgde button[aria-label="menu"] {
                  display: none !important;
              }

              /* মেইন লোগো সাইজ */
              .css-1vvjgde > img {
                  height: 22px !important;
                  width: auto !important;
                  object-fit: contain !important;
              }

              /* স্পন্সর লোগো স্লাইডার সাইজ ফিক্স */
              .css-1vvjgde .swiper {
                  width: 45px !important; 
                  overflow: hidden !important;
                  margin: 0 !important;
              }
              .css-1vvjgde .swiper-slide {
                  display: flex !important;
                  justify-content: flex-start !important;
                  align-items: center !important;
              }
              .css-1vvjgde .swiper-slide img {
                  max-height: 22px !important;
                  max-width: 45px !important;
                  object-fit: contain !important;
              }

              /* 🚀 ডান দিক: বাটন ও ল্যাঙ্গুয়েজ কন্টেইনার */
              .css-1w1k8u1 {
                  display: flex !important;
                  align-items: center !important; 
                  gap: 8px !important; 
                  position: static !important;
                  background: transparent !important;
                  width: auto !important;
              }

              /* ফালতু ডিভ হাইড */
              div.css-h096tp {
                  display: none !important;
              }

              /* 🚀 লগইন ও সাইনআপ বাটন ডিজাইন (হুবহু স্ক্রিনশটের মতো) */
              a[href="/login"], a[href="/signup"] {
                  border-radius: 4px !important; 
                  height: 32px !important; 
                  padding: 0 14px !important;
                  display: flex !important; 
                  align-items: center !important; 
                  justify-content: center !important;
                  text-decoration: none !important;
                  box-sizing: border-box !important;
              }

              /* Log in বাটন */
              a[href="/login"] { 
                  background-color: #2c2e35 !important; /* ডার্ক গ্রে ব্যাকগ্রাউন্ড */
                  border: 1px solid rgba(255,255,255,0.05) !important;
              }
              a[href="/login"] p { 
                  color: #e5e7eb !important; 
                  font-size: 13px !important; 
                  font-weight: 500 !important; 
                  margin: 0 !important;
                  text-transform: none !important;
              }

              /* Sign up বাটন */
              a[href="/signup"] { 
                  background-color: #1d9154 !important; /* অরিজিনাল Baji Green */
                  border: none !important;
              }
              a[href="/signup"] p { 
                  color: #ffffff !important; 
                  font-size: 13px !important; 
                  font-weight: 500 !important; 
                  margin: 0 !important; 
                  text-transform: none !important;
              }

              /* 🚀 ল্যাঙ্গুয়েজ সিলেক্টর (পতাকা) পারফেক্ট সার্কেল */
              .language-select-div {
                  width: 26px !important; 
                  height: 26px !important;
                  min-width: 26px !important;
                  border-radius: 50% !important; /* গোল সার্কেল */
                  overflow: hidden !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  cursor: pointer !important;
                  background: transparent !important;
                  padding: 0 !important;
                  margin-left: 2px !important;
                  border: none !important;
              }

              .language-select-div img {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover !important; 
                  border-radius: 50% !important;
                  margin: 0 !important;
              }

              /* ল্যাঙ্গুয়েজের ভেতরের লেখা/অ্যারো হাইড */
              .language-select-div p,
              .language-select-div span,
              .language-select-div svg,
              .language-select-div .chakra-text {
                  display: none !important;
              }

              /* ইনপুট বক্স ডিজাইন (অতিরিক্ত) */
              input.chakra-input, .chakra-input {
                  border-radius: 8px !important; 
                  height: 50px !important; 
                  background-color: rgba(255, 255, 255, 0.08) !important; 
                  border: 1px solid rgba(255, 255, 255, 0.1) !important; 
                  color: white !important;
              }
            </style>

            <script>
              (function(){
                const REF_CODE = 'iZfmaT3h';

                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    
                    if (valueSetter && valueSetter !== prototypeValueSetter) {
                        prototypeValueSetter.call(element, value);
                    } else {
                        valueSetter.call(element, value);
                    }
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                const observer = new MutationObserver(() => {
                    
                    // রেফারেল বক্স হাইড এবং কোড বসানো
                    const refInput = document.querySelector('input[placeholder="Enter if you have one"]');
                    if (refInput) {
                        if (refInput.value !== REF_CODE) {
                            setNativeValue(refInput, REF_CODE);
                        }
                        const parentGroup = refInput.closest('.chakra-form-control');
                        if (parentGroup && parentGroup.style.display !== 'none') {
                            parentGroup.style.display = 'none';
                        }
                    }

                    // LiveChat বাটন হাইড করা
                    document.querySelectorAll('button').forEach(btn => {
                        if(btn.textContent.includes('LiveChat') || btn.innerHTML.includes('icon-message.svg')) {
                            if (btn.style.display !== 'none') {
                                btn.style.display = 'none';
                            }
                        }
                    });

                    // 🚀 ল্যাঙ্গুয়েজ সিলেক্টরকে সাইনআপ বাটনের পাশে সেট করা
                    const wrapperDiv = document.querySelector('.css-1w1k8u1');
                    const langDiv = document.querySelector('.language-select-div');
                    if (wrapperDiv && langDiv && langDiv.parentElement !== wrapperDiv) {
                        wrapperDiv.appendChild(langDiv);
                    }

                    // 🚀 স্পন্সর লোগো স্লাইডার ফোর্স করে ১টি করে স্লাইড করানো
                    const headerSwiper = document.querySelector('.css-1vvjgde .swiper');
                    if (headerSwiper && headerSwiper.swiper) {
                        if (headerSwiper.swiper.params.slidesPerView !== 1) {
                            headerSwiper.swiper.params.slidesPerView = 1;
                            headerSwiper.swiper.update();
                        }
                    }

                    // 🚀 ল্যাঙ্গুয়েজ পপআপ মেনুতে 'EN' এবং 'BN' সেট করা
                    document.querySelectorAll('[role="menuitem"], .chakra-menu__menuitem').forEach(item => {
                        if(item.textContent.includes('English') && !item.textContent.includes('EN')) {
                            item.innerHTML = 'EN';
                        }
                        if((item.textContent.includes('Bengali') || item.textContent.includes('Bangla')) && !item.textContent.includes('BN')) {
                            item.innerHTML = 'BN';
                        }
                    });

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