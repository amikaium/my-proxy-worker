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
              /* ইনপুট বক্স ডিজাইন */
              input.chakra-input, .chakra-input {
                  border-radius: 8px !important; 
                  height: 50px !important; 
                  background-color: rgba(255, 255, 255, 0.08) !important; 
                  border: 1px solid rgba(255, 255, 255, 0.1) !important; 
                  color: white !important;
              }
              .chakra-input__right-addon, .chakra-input__left-addon {
                  height: 50px !important; 
                  border-radius: 8px !important; 
                  display: flex !important;
                  align-items: center !important; 
                  justify-content: center !important;
              }
              .chakra-input__right-addon svg, .chakra-input__left-addon svg,
              .chakra-input__right-addon img, .chakra-input__left-addon img {
                  margin: auto !important;
                  display: block !important;
              }

              /* 🚀 আপডেট: হেডারের লগইন, সাইনআপ ও ল্যাঙ্গুয়েজ সিলেক্টর পজিশনিং */
              .custom-header-auth-buttons {
                  position: fixed !important;
                  top: 10px !important; 
                  right: 10px !important; 
                  bottom: auto !important;
                  left: auto !important;
                  display: flex !important;
                  align-items: center !important; /* সব সেন্টারে থাকবে */
                  gap: 8px !important; /* বাটনের মাঝে গ্যাপ */
                  z-index: 99999 !important;
                  width: auto !important;
                  background: transparent !important;
              }

              /* 🚀 আপডেট: বাটন সাইজ ও শেপ (২নং স্ক্রিনশট অনুযায়ী) */
              .custom-header-auth-buttons a {
                  border-radius: 4px !important; /* হালকা স্কয়ার শেপ */
                  height: 32px !important; /* হাইট কমানো হয়েছে */
                  padding: 0 12px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  border: none !important;
                  text-decoration: none !important;
              }

              .custom-header-auth-buttons a p {
                  margin: 0 !important;
                  text-align: center !important;
                  font-size: 13px !important;
                  font-weight: bold !important;
                  text-transform: capitalize !important;
              }

              /* লগইন বাটন কালার (Jeetbuzz স্টাইল) */
              .custom-header-auth-buttons a[href="/login"] {
                  background-color: #3b3b3b !important; /* ডার্ক গ্রে */
              }
              .custom-header-auth-buttons a[href="/login"] p {
                  color: #ffffff !important; /* সাদা লেখা */
              }

              /* সাইনআপ বাটন কালার (Jeetbuzz স্টাইল) */
              .custom-header-auth-buttons a[href="/signup"] {
                  background-color: #ffb800 !important; /* ইয়েলো/অরেঞ্জ */
              }
              .custom-header-auth-buttons a[href="/signup"] p {
                  color: #000000 !important; /* কালো লেখা */
              }

              /* 🚀 আপডেট: ল্যাঙ্গুয়েজ সিলেক্টর (পতাকা) সার্কেল ডিজাইন */
              .custom-header-auth-buttons .language-select-div {
                  width: 32px !important; /* বাটনের হাইটের সমান */
                  height: 32px !important;
                  border-radius: 50% !important; /* গোল সার্কেল */
                  overflow: hidden !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  cursor: pointer !important;
                  background: transparent !important;
                  padding: 0 !important;
                  margin-left: 2px !important;
              }

              .custom-header-auth-buttons .language-select-div img {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover !important;
                  border-radius: 50% !important;
              }

              /* ল্যাঙ্গুয়েজের পাশের লেখা হাইড করা */
              .custom-header-auth-buttons .language-select-div span,
              .custom-header-auth-buttons .language-select-div p {
                  display: none !important;
              }

              /* 🚀 আপডেট: হেডারের লোগো স্লাইডার ১টি করে স্লাইড করার জন্য */
              .css-1vvjgde .swiper-slide {
                  width: 100% !important; /* একটি স্লাইড ফুল জায়গা নিবে */
                  display: flex !important;
                  justify-content: center !important;
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

                    // 🚀 আপডেট: বাটন ও ল্যাঙ্গুয়েজ সিলেক্টর হেডারে একসাথে সেট করা
                    const loginBtnNode = document.querySelector('a[href="/login"]');
                    const signupBtnNode = document.querySelector('a[href="/signup"]');
                    
                    if (loginBtnNode && signupBtnNode && loginBtnNode.parentElement === signupBtnNode.parentElement) {
                        const wrapperDiv = loginBtnNode.parentElement;
                        if (!wrapperDiv.classList.contains('custom-header-auth-buttons')) {
                            wrapperDiv.classList.add('custom-header-auth-buttons');
                        }

                        // ল্যাঙ্গুয়েজ সিলেক্টরকে সাইনআপের ডানপাশে নিয়ে আসা
                        const langDiv = document.querySelector('.language-select-div');
                        if (langDiv && langDiv.parentElement !== wrapperDiv) {
                            wrapperDiv.appendChild(langDiv);
                        }
                    }

                    // 🚀 আপডেট: লোগো স্লাইডার ফোর্স করে ১টি করে স্লাইড করানো (JS Method)
                    const headerSwiper = document.querySelector('.css-1vvjgde .swiper');
                    if (headerSwiper && headerSwiper.swiper) {
                        if (headerSwiper.swiper.params.slidesPerView !== 1) {
                            headerSwiper.swiper.params.slidesPerView = 1;
                            headerSwiper.swiper.update();
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