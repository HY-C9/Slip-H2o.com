(function() {
    let powerSavingMode = false;
    let currentBgSrc = '';
    const imageCache = {};

    function getCachedImage(src) {
        if (!src) return null;
        if (!imageCache[src]) {
            const img = new Image();
            img.onload = () => {
                if (typeof window.updateDisplay === 'function') window.updateDisplay();
            };
            img.src = src;
            imageCache[src] = img;
        }
        return imageCache[src];
    }

    getCachedImage('assets/image/bs/backgroundEnter-KT4.1.jpg');

    function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
            new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
            new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
            new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
        ];

        return Promise.allSettled(fonts.map(font => font.load())).then(results => {
            results.forEach(result => {
                if (result.status === 'fulfilled') document.fonts.add(result.value);
            });
        });
    }

    function setCurrentDateTime() {
        const now = new Date();
        const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
        
        const dt = document.getElementById('datetime');
        if(dt) dt.value = localDateTime.substring(0, 16);
        
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const dtPlusOne = document.getElementById('datetime_plus_one');
        if(dtPlusOne) dtPlusOne.value = `${hours}:${minutes}`;
    }

    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }

    function formatDateWithDay(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]}`;
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const day = padZero(d.getDate());
        const month = padZero(d.getMonth() + 1);
        const year = "20" + d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }

    window.onload = function() {
        setCurrentDateTime();
        loadFonts().then(function() {
            document.fonts.ready.then(function() {
                if(window.updateDisplay) window.updateDisplay(); 
            });
        }).catch(function() {
            if(window.updateDisplay) window.updateDisplay();
        });
    };

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');

        const activeBgMode = document.getElementById('activeBgMode')?.value || 'system';
        const customBgUrl = document.getElementById('customImageDataUrl')?.value || '';
        const bgSelect = document.getElementById('backgroundSelect')?.value || 'assets/image/bs/backgroundEnter-KT4.1.jpg';

        const datetime = document.getElementById('datetime')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        const isPowerSaving = document.getElementById('powerSavingMode')?.classList.contains('btn-warning') || false;
        
        const money01 = document.getElementById('money01')?.value || '-';
        const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
        const bank1 = document.getElementById('bank1')?.value || '-';
        const receiveraccount = document.getElementById('receiveraccount')?.value || '-';

        const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10));
        const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-';
        const formattedTimePlusOne = datetimePlusOne;

        let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
        let timeMessage = "ตอนนี้";
        if (timeDifference >= 60) timeMessage = `${Math.floor(timeDifference / 60)} ชั่วโมงที่แล้ว`;
        else if (timeDifference > 1) timeMessage = `${timeDifference} นาทีที่แล้ว`;
        else if (timeDifference === 1) timeMessage = "1 นาทีที่แล้ว";

        // ฟังก์ชันวาด UI ข้อมูลการแจ้งเตือน
        const drawUI = () => {
            drawText(ctx, `   ${formattedDateWithDay}   `, 308, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);
            drawText(ctx, `${formattedTimePlusOne}`, 295, 298.8, 138.50, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -7);

            drawText(ctx, `รับเงินสำเร็จ`, 107.8, 1007, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${timeMessage}`, 547.5, 1007, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `ได้รับ +${money01} บาท เข้าบัญชี ${senderaccount1} จากบัญชี ${bank1} ${receiveraccount}`, 107.8, 1038, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 430, -0.25);

            drawBattery(ctx, batteryLevel, isPowerSaving);
        };

        // ฟังก์ชันวาดกรอบ
        const drawOverlaysAndUI = () => {
            let loadedCount = 0;
            const img1 = new Image();
            const img2 = new Image();
            let img1Success = false, img2Success = false;

            const checkAndDrawText = () => {
                loadedCount++;
                if (loadedCount === 2) {
                    if (img1Success) {
                        ctx.globalAlpha = 0.75; 
                        ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
                        ctx.globalAlpha = 1.0; 
                    }
                    if (img2Success) {
                        ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                    }
                    drawUI();
                }
            };

            // โหลดกรอบ KT4
            img1.onload = () => { img1Success = true; checkAndDrawText(); };
            img1.onerror = () => { checkAndDrawText(); };
            img1.src = 'assets/image/bs/backgroundEnter-KTB3.666.png'; 

            img2.onload = () => { img2Success = true; checkAndDrawText(); };
            img2.onerror = () => { checkAndDrawText(); };
            img2.src = 'assets/image/bs/backgroundEnter-KTB3.667.png'; 
        };

        // เช็คโหมดและวาดภาพพื้นหลัง
        if (activeBgMode === 'custom' && customBgUrl) {
            const userImg = new Image();
            userImg.onload = function() {
                const imgRatio = userImg.width / userImg.height;
                const canvasRatio = canvas.width / canvas.height;
                let renderW, renderH, offsetX = 0, offsetY = 0;
                
                if (imgRatio < canvasRatio) {
                    renderW = canvas.width;
                    renderH = canvas.width / imgRatio;
                    offsetY = (canvas.height - renderH) / 2;
                } else {
                    renderH = canvas.height;
                    renderW = canvas.height * imgRatio;
                    offsetX = (canvas.width - renderW) / 2;
                }
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(userImg, offsetX, offsetY, renderW, renderH);
                drawOverlaysAndUI(); 
            };
            userImg.onerror = function() {
                ctx.fillStyle = "#e0f2fe";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawOverlaysAndUI();
            };
            userImg.src = customBgUrl;

        } else {
            if (bgSelect && bgSelect !== currentBgSrc) {
                currentBgSrc = bgSelect;
                const imgToDraw = getCachedImage(bgSelect);
                if(imgToDraw && imgToDraw.complete) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);
                    drawUI();
                }
            } else {
                const bgImg = getCachedImage(bgSelect);
                if (bgImg && bgImg.complete) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "#e0f2fe";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                drawUI(); 
            }
        }
    };

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const safeText = String(text || '');
        const paragraphs = safeText.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            const words = [...segmenter.segment(paragraph)].map(s => s.segment);
            let lines = [], currentLine = '';

            words.forEach(word => {
                const testLine = currentLine + word;
                const testWidth = ctx.measureText(testLine).width + (testLine.length - 1) * letterSpacing;
                if (testWidth > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) lines.push(currentLine.trimStart());

            lines.forEach((line, index) => {
                let currentX = x;
                if (align === 'center') currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
                else if (align === 'right') currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                
                drawTextLine(ctx, line, currentX, currentY, letterSpacing);
                currentY += lineHeight;
                if (maxLines && index >= maxLines - 1) return;
            });
            currentY += lineHeight;
        });
    }

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }

        const characters = [...(new Intl.Segmenter('th', { granularity: 'grapheme' })).segment(String(text))].map(s => s.segment);
        let currentX = x;

        characters.forEach((char, index) => {
            const code = char.charCodeAt(0);
            const prevChar = index > 0 ? characters[index - 1].charCodeAt(0) : null;

            let yOff = 0, xOff = 0;
            if (code >= 0x0E34 && code <= 0x0E37) yOff = -1;
            if (code >= 0x0E48 && code <= 0x0E4C) {
                if (prevChar && ((prevChar >= 0x0E34 && prevChar <= 0x0E37) || prevChar === 0x0E31)) yOff = -8;
                else xOff = -7;
            }
            if (code === 0x0E31) { yOff = -1; xOff = 1; }
            if (code >= 0x0E38 && code <= 0x0E3A) { xOff = -10; }

            ctx.fillText(char, currentX + xOff, y + yOff);

            if (![0x0E48,0x0E49,0x0E4A,0x0E4B,0x0E4C,0x0E31,0x0E34,0x0E35,0x0E36,0x0E37,0x0E38,0x0E39,0x0E3A].includes(code)) {
                currentX += ctx.measureText(char).width + letterSpacing;
            } else {
                currentX += ctx.measureText(char).width;
            }
        });
    }

    function drawBattery(ctx, batteryLevel, powerSavingMode) {
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b'; 
        ctx.fillStyle = '#ffffff'; 
        
        let batteryColor = '#ffffff'; 
        if (batteryLevel <= 20) batteryColor = '#ff0000'; 
        else if (powerSavingMode) batteryColor = '#fccd0e'; 

        const fillWidth = (batteryLevel / 100) * 31; 
        const x = 511.5, y = 32.4, height = 13.8, radius = 4; 

        ctx.fillStyle = batteryColor; 
        ctx.beginPath(); 
        ctx.moveTo(x, y + radius); 
        ctx.lineTo(x, y + height - radius); 
        ctx.arcTo(x, y + height, x + radius, y + height, radius); 
        ctx.lineTo(x + fillWidth - radius, y + height); 
        ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); 
        ctx.lineTo(x + fillWidth, y + radius); 
        ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); 
        ctx.lineTo(x + radius, y); 
        ctx.arcTo(x, y, x, y + radius, radius); 
        ctx.closePath(); 
        ctx.fill(); 
    }

    // ==========================================
    // 🛠️ ส่วนระบบจัดการ ฟอร์ม, อัปโหลดรูป, เซฟ, โหลด 
    // ==========================================

    window.togglePowerSavingMode = function() {
        const btn = document.getElementById('powerSavingMode');
        if(btn) {
            if (btn.classList.contains('btn-warning')) {
                btn.classList.remove('btn-warning');
                btn.classList.add('btn-outline-warning');
            } else {
                btn.classList.remove('btn-outline-warning');
                btn.classList.add('btn-warning');
            }
        }
        if (typeof window.updateDisplay === 'function') window.updateDisplay();
    };

    window.updateBatteryUI = function() {
        const val = document.getElementById('battery')?.value || '100';
        const bl = document.getElementById('battery-level');
        if(bl) bl.innerText = val;
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_ktb3.png';
        link.click();
    };

    window.activateSystemMode = function() {
        document.getElementById('activeBgMode').value = 'system';
        document.getElementById('sysZone').className = "mb-3 p-3 rounded border-success bg-success bg-opacity-10 bg-zone border";
        document.getElementById('sysLabel').className = "form-label text-success fw-bold";
        document.getElementById('sysIcon').className = "bi bi-check-circle-fill me-1";
        document.getElementById('backgroundSelect').className = "form-select border-success";
        
        document.getElementById('customZone').className = "p-3 rounded border-secondary opacity-75 bg-zone border";
        document.getElementById('customLabel').className = "form-label text-secondary fw-bold";
        document.getElementById('customIcon').className = "bi bi-circle me-1";
        document.getElementById('customBackgroundInput').className = "form-control text-secondary border-secondary";

        if(window.updateDisplay) window.updateDisplay();
    };

    window.activateCustomMode = function() {
        document.getElementById('activeBgMode').value = 'custom';
        document.getElementById('sysZone').className = "mb-3 p-3 rounded border-secondary opacity-75 bg-zone border";
        document.getElementById('sysLabel').className = "form-label text-secondary fw-bold";
        document.getElementById('sysIcon').className = "bi bi-circle me-1";
        document.getElementById('backgroundSelect').className = "form-select border-secondary text-secondary";
        
        document.getElementById('customZone').className = "p-3 rounded border-warning bg-warning bg-opacity-10 bg-zone border";
        document.getElementById('customLabel').className = "form-label text-warning fw-bold";
        document.getElementById('customIcon').className = "bi bi-check-circle-fill me-1";
        document.getElementById('customBackgroundInput').className = "form-control text-warning border-warning";

        if(window.updateDisplay) window.updateDisplay();
    };

    const setupCustomImage = function(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const tempCanvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; 
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > MAX_WIDTH) {
                        height = Math.floor(height * (MAX_WIDTH / width));
                        width = MAX_WIDTH;
                    }
                    
                    tempCanvas.width = width;
                    tempCanvas.height = height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.7);
                    
                    document.getElementById('customImageDataUrl').value = compressedDataUrl;
                    window.activateCustomMode();

                    const dropZone = document.getElementById('pasteDropZone');
                    if (dropZone) {
                        const originalBg = dropZone.style.background;
                        const originalBorder = dropZone.style.borderColor;
                        dropZone.style.background = 'rgba(27, 165, 225, 0.2)'; 
                        dropZone.style.borderColor = '#1ba5e1';
                        setTimeout(() => {
                            dropZone.style.background = originalBg;
                            dropZone.style.borderColor = originalBorder;
                        }, 400);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('customBackgroundInput')?.addEventListener('change', function(e) {
        setupCustomImage(e.target.files[0]);
    });

    window.addEventListener('paste', function(e) {
        if(document.activeElement.tagName === 'INPUT' && document.activeElement.type !== 'file') return; 

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                setupCustomImage(blob);
                e.preventDefault();
                break;
            }
        }
    });

    const dropZone = document.getElementById('pasteDropZone');
    if(dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.background = 'rgba(245, 158, 11, 0.05)';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setupCustomImage(e.dataTransfer.files[0]);
            }
        });
    }

    window.saveDataKTB3 = function() {
        try {
            const data = {
                activeBgMode: document.getElementById('activeBgMode')?.value || 'system',
                backgroundSelect: document.getElementById('backgroundSelect')?.value || '',
                customImageDataUrl: document.getElementById('customImageDataUrl')?.value || '',
                
                battery: document.getElementById('battery')?.value || '100',
                senderaccount1: document.getElementById('senderaccount1')?.value || '',
                money01: document.getElementById('money01')?.value || '',
                datetime: document.getElementById('datetime')?.value || '',
                bank1: document.getElementById('bank1')?.value || '',
                receiveraccount: document.getElementById('receiveraccount')?.value || ''
            };
            
            localStorage.setItem('NOTIFY_KTB3_SAVED_DATA', JSON.stringify(data));
            alert('บันทึกข้อมูลและรูปพื้นหลังเรียบร้อยแล้ว!');
        } catch(e) {
            alert('เกิดข้อผิดพลาด: ไฟล์รูปอาจมีขนาดใหญ่เกินไป');
            console.error(e);
        }
    };

    window.loadDataKTB3 = function() {
        const savedData = localStorage.getItem('NOTIFY_KTB3_SAVED_DATA');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            if(data.battery) { document.getElementById('battery').value = data.battery; window.updateBatteryUI(); }
            if(data.senderaccount1) document.getElementById('senderaccount1').value = data.senderaccount1;
            if(data.money01) document.getElementById('money01').value = data.money01;
            if(data.datetime) document.getElementById('datetime').value = data.datetime;
            if(data.bank1) document.getElementById('bank1').value = data.bank1;
            if(data.receiveraccount) document.getElementById('receiveraccount').value = data.receiveraccount;
            
            if(data.backgroundSelect) document.getElementById('backgroundSelect').value = data.backgroundSelect;
            if(data.customImageDataUrl) document.getElementById('customImageDataUrl').value = data.customImageDataUrl;
            
            if(data.activeBgMode === 'custom' && data.customImageDataUrl) {
                window.activateCustomMode();
            } else {
                window.activateSystemMode();
            }

            if(window.updateDisplay) window.updateDisplay();
            alert('โหลดข้อมูลกลับมาสำเร็จ!');
        } else {
            alert('ยังไม่มีข้อมูลที่บันทึกไว้ในเครื่องนี้');
        }
    };

    window.clearForm = function() {
        const now = new Date();
        const timeStr = now.toTimeString().slice(0,5);
        if(document.getElementById('datetime_plus_one')) document.getElementById('datetime_plus_one').value = timeStr;
        if(document.getElementById('backgroundSelect')) document.getElementById('backgroundSelect').selectedIndex = 0;
        if(document.getElementById('customImageDataUrl')) document.getElementById('customImageDataUrl').value = '';
        
        if(document.getElementById('battery')) {
            document.getElementById('battery').value = 100;
            window.updateBatteryUI();
        }

        const btnPower = document.getElementById('powerSavingMode');
        if(btnPower && btnPower.classList.contains('btn-warning')) {
            window.togglePowerSavingMode();
        }

        if(document.getElementById('senderaccount1')) document.getElementById('senderaccount1').value = 'XXX-X-XX875-3';
        if(document.getElementById('money01')) document.getElementById('money01').value = '30,365.00';
        
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const localISO = now.toISOString().slice(0, 16);
        if(document.getElementById('datetime')) document.getElementById('datetime').value = localISO;
        
        if(document.getElementById('bank1')) document.getElementById('bank1').selectedIndex = 0;
        if(document.getElementById('receiveraccount')) document.getElementById('receiveraccount').value = 'XXX-X-XX142-6';

        window.activateSystemMode();
        if(window.updateDisplay) window.updateDisplay();
    };

})();
