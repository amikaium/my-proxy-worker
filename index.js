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
                  z-index: 1000 !important;
              }

              /* 🚀 বাম দিক: মেনু, লোগো এবং স্পন্সর */
              .css-1vvjgde {
                  display: flex !important;
                  align-items: center !important;
                  gap: 12px !important; 
                  position: static !important; 
                  transform: none !important;
              }

              .css-1vvjgde button[aria-label="menu"] {
                  display: flex !important;
                  background: transparent !important;
                  padding: 0 !important;
                  margin: 0 !important;
              }

              .css-1vvjgde > img {
                  height: 22px !important;
                  width: auto !important;
                  object-fit: contain !important;
              }

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

              /* 🚀 ডান দিক: লগইন ও সাইনআপ বাটন কন্টেইনার */
              .fixed-auth-container {
                  position: fixed !important; 
                  top: 11px !important;
                  right: 12px !important;
                  display: flex !important;
                  align-items: center !important; 
                  gap: 8px !important; 
                  z-index: 99999 !important;
                  width: auto !important;
                  background: transparent !important;
              }

              /* 🛡️ অরিজিনাল ব্যালেন্স হাইড করা (মুভ না করে) */
              .hide-original-balance {
                  opacity: 0 !important;
                  visibility: hidden !important;
                  height: 0px !important;
                  overflow: hidden !important;
                  pointer-events: none !important;
                  position: absolute !important;
                  z-index: -9999 !important;
              }

              /* 🚀 আমাদের নতুন কাস্টম ব্যালেন্স বক্স (সবকিছুর উপরে ভাসবে) */
              #arfan-custom-balance {
                  position: fixed !important;
                  top: 11px !important; 
                  right: 12px !important; 
                  z-index: 2147483647 !important; /* ম্যাক্সিমাম পাওয়ার */
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: flex-end !important;
                  pointer-events: auto !important;
              }

              /* কাস্টম বক্সের ভিতরের টেক্সট ডিজাইন */
              #arfan-custom-balance p, 
              #arfan-custom-balance span, 
              #arfan-custom-balance div {
                  text-align: right !important;
                  margin: 0 !important;
                  line-height: 1.2 !important;
                  color: #FEAC04 !important; /* গোল্ডেন কালার */
              }

              /* ইউজারনেম সাইজ */
              #arfan-custom-balance > :first-child {
                  font-size: 11px !important;
                  opacity: 0.9 !important;
              }
              
              /* BDT ব্যালেন্স সাইজ */
              #arfan-custom-balance > :nth-child(2) {
                  font-size: 13px !important;
                  font-weight: bold !important;
                  display: flex !important;
                  align-items: center !important;
                  gap: 4px !important;
              }

              /* রিফ্রেশ আইকন */
              #arfan-custom-balance svg {
                  cursor: pointer !important;
                  fill: #FEAC04 !important;
              }

              /* Language Selector হাইড */
              .language-select-div { display: none !important; }

              /* লগইন ও সাইনআপ বাটন ডিজাইন */
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

              a[href="/login"] { 
                  background-color: #2c2e35 !important; 
                  border: 1px solid rgba(255,255,255,0.05) !important;
              }
              a[href="/login"] p { color: #e5e7eb !important; font-size: 13px !important; margin: 0 !important; }

              a[href="/signup"] { background-color: #1d9154 !important; border: none !important; }
              a[href="/signup"] p { color: #ffffff !important; font-size: 13px !important; margin: 0 !important; }

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
                    
                    if (valueSetter && valueSetter !== prototypeValueSetter) {
                        prototypeValueSetter.call(element, value);
                    } else {
                        valueSetter.call(element, value);
                    }
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // টেক্সট খোঁজার ফাংশন
                function findTextNode(text) {
                    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                    let node;
                    while (node = walker.nextNode()) {
                        if (node.nodeValue.includes(text)) {
                            return node;
                        }
                    }
                    return null;
                }

                const observer = new MutationObserver(() => {
                    
                    // রেফারেল কোড
                    const refInput = document.querySelector('input[placeholder="Enter if you have one"]');
                    if (refInput) {
                        if (refInput.value !== REF_CODE) setNativeValue(refInput, REF_CODE);
                        const parentGroup = refInput.closest('.chakra-form-control');
                        if (parentGroup && parentGroup.style.display !== 'none') parentGroup.style.display = 'none';
                    }

                    // চ্যাট হাইড
                    document.querySelectorAll('button').forEach(btn => {
                        if(btn.textContent.includes('LiveChat') || btn.innerHTML.includes('icon-message.svg')) {
                            if (btn.style.display !== 'none') btn.style.display = 'none';
                        }
                    });

                    // লগ আউট অবস্থায় বাটন ফিক্স
                    const loginBtnNode = document.querySelector('a[href="/login"]');
                    if (loginBtnNode && loginBtnNode.parentElement) {
                        if (!loginBtnNode.parentElement.classList.contains('fixed-auth-container')) {
                            loginBtnNode.parentElement.classList.add('fixed-auth-container');
                        }
                        // যদি লগইন বাটন থাকে, তার মানে ইউজার লগআউট অবস্থায় আছে, তখন কাস্টম ব্যালেন্স হাইড রাখবো
                        const cloneBox = document.getElementById('arfan-custom-balance');
                        if(cloneBox) cloneBox.style.display = 'none';
                    }

                    // 🚀 The Magic: Clone & Sync Method
                    const bdtTextNode = findTextNode('BDT:');
                    if (bdtTextNode) {
                        let originalWrapper = bdtTextNode.parentElement;
                        
                        // মেইন কন্টেইনার খোঁজা
                        for(let i=0; i<4; i++){
                            if(originalWrapper.parentElement && 
                               !originalWrapper.parentElement.innerText.includes('Promotions') && 
                               !originalWrapper.parentElement.innerText.includes('Deposit')) {
                                originalWrapper = originalWrapper.parentElement;
                            } else {
                                break;
                            }
                        }
                        
                        // ১. অরিজিনাল ব্যালেন্সকে তার জায়গাতেই সেফলি অদৃশ্য করে দেওয়া
                        if (!originalWrapper.classList.contains('hide-original-balance')) {
                            originalWrapper.classList.add('hide-original-balance');
                        }

                        // ২. বডির একদম শেষে আমাদের নিজস্ব একটি স্বাধীন এলিমেন্ট তৈরি করা
                        let cloneBox = document.getElementById('arfan-custom-balance');
                        if (!cloneBox) {
                            cloneBox = document.createElement('div');
                            cloneBox.id = 'arfan-custom-balance';
                            document.body.appendChild(cloneBox);

                            // রিফ্রেশ বাটন ক্লিক করলে অরিজিনাল বাটনে ক্লিক ফায়ার হবে!
                            cloneBox.addEventListener('click', (e) => {
                                const realSvg = originalWrapper.querySelector('svg');
                                if(realSvg) {
                                    realSvg.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                }
                            });
                        }

                        // ৩. অরিজিনাল ডাটা আমাদের কাস্টম বক্সে লাইভ কপি করা
                        cloneBox.style.display = 'flex'; // শো করানো
                        if (cloneBox.innerHTML !== originalWrapper.innerHTML) {
                            cloneBox.innerHTML = originalWrapper.innerHTML;
                        }
                    }

                    // স্পন্সর লোগো
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
