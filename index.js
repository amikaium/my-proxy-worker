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
            
            // 🚀 CSS & JS ইনজেকশন
            const customStylesAndScripts = `
            <style>
              /* ==========================================
                 🎨 সাইনআপ পেজের আপডেট ডিজাইন
                 ========================================== */
              
              /* মেইন পেজ ব্যাকগ্রাউন্ড */
              .page-signup body {
                  background-color: #121212 !important; 
              }

              /* ইনপুট গ্রুপ কন্টেইনার */
              .page-signup .chakra-form-control .chakra-input-group {
                  background-color: transparent !important; 
                  border: none !important; 
              }

              /* মেইন ইনপুট বক্স (উচ্চতা 45px) */
              .page-signup .chakra-input {
                  height: 45px !important; 
                  background-color: #2c2c2c !important; 
                  border-radius: 4px !important; 
                  border: 1px solid #4e4e4e !important; 
                  color: #ffffff !important; 
              }

              /* প্লেসহোল্ডার টেক্সট কালার */
              .page-signup .chakra-input::placeholder {
                  color: #808080 !important; 
              }

              /* -------------------------------------------
                 🔥 কনফার্ম বাটন (Confirm Button) ফিক্স
                 ------------------------------------------- */
              .page-signup button.chakra-button {
                  height: 45px !important; 
                  border-radius: 4px !important; 
              }

              /* -------------------------------------------
                 🔥 পাসওয়ার্ড চোখের আইকন (Eye Icon) ফিক্স - 100% Vertical Middle
                 ------------------------------------------- */
              .page-signup .chakra-input__right-element {
                  height: 45px !important; 
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  top: 0 !important;
              }
              .page-signup .chakra-input__right-element button {
                  height: 100% !important;
                  width: 100% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  border-radius: 0 !important; 
                  padding: 0 !important; /* ডিফল্ট প্যাডিং রিমুভ */
                  margin: 0 !important;  /* ডিফল্ট মার্জিন রিমুভ */
              }
              .page-signup .chakra-input__right-element svg {
                  display: block !important;
                  margin: auto !important; 
              }

              /* -------------------------------------------
                 লেফট অ্যাডঅন (দেশের কোড) - ব্যাকগ্রাউন্ড #2c2c2c
                 ------------------------------------------- */
              .page-signup .chakra-input__left-addon {
                  background-color: #2c2c2c !important; 
                  border-radius: 4px !important; 
                  border: 1px solid #4e4e4e !important; 
                  color: #ffffff !important; 
                  font-weight: 500 !important;
                  height: 45px !important;
                  margin-right: 10px !important; 
              }
              .page-signup .chakra-input__left-addon img.chakra-image {
                  margin-right: 5px !important;
              }

              /* -------------------------------------------
                 রাইট অ্যাডঅন (ভেরিফিকেশন কোড) - পেডিং 5px
                 ------------------------------------------- */
              .page-signup .chakra-input__right-addon {
                  background-color: #EEEEEE !important; 
                  border-radius: 4px !important; 
                  border: 1px solid #4e4e4e !important; 
                  color: #121212 !important; 
                  font-weight: 700 !important; 
                  height: 45px !important;
                  margin-left: 10px !important; 
                  padding: 5px !important; 
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
              }
              /* 🔥 রিফ্রেশ বাটনে উপরে নিচে 5px মার্জিন */
              .page-signup .chakra-input__right-addon button {
                  margin-top: 5px !important;
                  margin-bottom: 5px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
              }
              .page-signup .chakra-input__right-addon .chakra-image {
                  filter: brightness(0.1) !important;
                  margin-left: 8px !important;
              }
            </style>

            <script>
              (function(){
                // ==========================================
                // 🔄 ডাইনামিক বডি ক্লাস সিস্টেম
                // ==========================================
                function updateBodyClass() {
                    document.body.className = document.body.className.replace(/\\bpage-[^ ]*[ ]?\\b/g, '');
                    let path = window.location.pathname.replace(/\\//g, '');
                    if(path === '') path = 'home';
                    document.body.classList.add('page-' + path);
                }

                let lastUrl = location.href; 
                const urlObserver = new MutationObserver(() => {
                  const url = location.href;
                  if (url !== lastUrl) {
                    lastUrl = url;
                    updateBodyClass(); 
                  }
                });

                // ==========================================
                // 📝 রেফারেল কোড অটো-ফিল এবং কাস্টম স্ক্রিপ্ট
                // ==========================================
                const REF_CODE = 'iZfmaT3h';

                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, value);
                    else valueSetter.call(element, value);
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                const domObserver = new MutationObserver(() => {
                    // ১. রেফারেল কোড অটো-ফিল
                    const refInput = document.querySelector('input[placeholder="Enter if you have one"]');
                    if (refInput) {
                        if (refInput.value !== REF_CODE) setNativeValue(refInput, REF_CODE);
                        const parentGroup = refInput.closest('.chakra-form-control');
                        if (parentGroup && parentGroup.style.display !== 'none') parentGroup.style.display = 'none';
                    }

                    // ২. ফোন নাম্বার বক্সকে Number Keypad (tel) করা
                    const phoneInput = document.querySelector('input[placeholder="Phone Number"]');
                    if (phoneInput && phoneInput.type !== 'tel') {
                        phoneInput.type = 'tel';
                    }

                    // ৩. ভেরিফিকেশন কোড বক্সকে Number Keypad (number) করা
                    const codeInput = document.querySelector('input[placeholder="Enter 4 digit code"]');
                    if (codeInput && codeInput.type !== 'number') {
                        codeInput.type = 'number';
                    }

                    // ৪. টার্মস এবং কন্ডিশন চেকবক্সে অটোমেটিক টিক (✔) দেওয়া (যেকোনো সময় ব্যাক করলেও কাজ করবে)
                    const agreeCheckbox = document.querySelector('input[type="checkbox"]');
                    // 'data-auto-checked' অ্যাট্রিবিউট চেক করা হচ্ছে, যাতে নতুন করে পেজ বা কম্পোনেন্ট এলেই কাজ করে
                    if (agreeCheckbox && !agreeCheckbox.hasAttribute('data-auto-checked')) {
                        if (!agreeCheckbox.checked) {
                            agreeCheckbox.click(); // রিয়েক্টে ক্লিক ফায়ার করে চেক করা
                        }
                        agreeCheckbox.setAttribute('data-auto-checked', 'true'); // মার্ক করে দেওয়া হলো
                    }
                });

                window.addEventListener('load', () => {
                    updateBodyClass(); 
                    urlObserver.observe(document, {subtree: true, childList: true});
                    domObserver.observe(document.body, { childList: true, subtree: true });
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
