// js/banks/notify_kbank1.js

(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetThin', `url(${fontPath}/SukhumvitSet-Thin.woff)`),
            new FontFace('SukhumvitSetText', `url(${fontPath}/SukhumvitSet-Text.woff)`),
            new FontFace('SukhumvitSetLight', `url(${fontPath}/SukhumvitSet-Light.woff)`),
            new FontFace('SukhumvitSetMedium', `url(${fontPath}/SukhumvitSet-Medium.woff)`),
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
            new FontFace('SukhumvitSetBold', `url(${fontPath}/SukhumvitSet-Bold.woff)`),
            new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
            new FontFace('SFThonburiLight', `url(${fontPath}/SFThonburi.woff)`),
            new FontFace('SFThonburiRegular', `url(${fontPath}/SFThonburi-Regular.woff)`),
            new FontFace('SFThonburiSemiBold', `url(${fontPath}/SFThonburi-Semibold.woff)`),
            new FontFace('SFThonburiBold', `url(${fontPath}/SFThonburi-Bold.woff)`),
            new FontFace('KanitThin', `url(${fontPath}/Kanit-Thin.woff)`),
            new FontFace('KanitExtraLight', `url(${fontPath}/Kanit-ExtraLight.woff)`),
            new FontFace('KanitLight', `url(${fontPath}/Kanit-Light.woff)`),
            new FontFace('KanitRegular', `url(${fontPath}/Kanit-Regular.woff)`),
            new FontFace('KanitMedium', `url(${fontPath}/Kanit-Medium.woff)`),
            new FontFace('KanitSemiBold', `url(${fontPath}/Kanit-SemiBold.woff)`),
            new FontFace('KanitBold', `url(${fontPath}/Kanit-Bold.woff)`),
            new FontFace('KanitExtraBold', `url(${fontPath}/Kanit-ExtraBold.woff)`),
            new FontFace('KanitBlack', `url(${fontPath}/Kanit-Black.woff)`),
            new FontFace('BangkokTime1', `url(${fontPath}/Bangkok-Time1.woff)`),
            new FontFace('BangkokTime2', `url(${fontPath}/Bangkok-Time2.woff)`),
            new FontFace('BangkokMoney', `url(${fontPath}/Bangkok-Money.woff)`),
            new FontFace('BangkokTime', `url(${fontPath}/Bangkok-Time.woff)`),
            new FontFace('THSarabunRegular', `url(${fontPath}/THSarabun.woff)`),
            new FontFace('THSarabunBold', `url(${fontPath}/THSarabun-Bold.woff)`),
            new FontFace('THSarabunItalic', `url(${fontPath}/THSarabun-Italic.woff)`),
            new FontFace('THSarabunBoldItalic', `url(${fontPath}/THSarabun-BoldItalic.woff)`),
            new FontFace('THSarabunNew', `url(${fontPath}/THSarabunNew.woff)`),
            new FontFace('THSarabunNewBold', `url(${fontPath}/THSarabunNew-Bold.woff)`),
            new FontFace('THSarabunNewItalic', `url(${fontPath}/THSarabunNew-Italic.woff)`),
            new FontFace('THSarabunNewBoldItalic', `url(${fontPath}/THSarabunNew-BoldItalic.woff)`),
            new FontFace('DXKrungthaiSemiBold', `url(${fontPath}/DX-Krungthai-SemiBold.woff)`),
            new FontFace('DXKrungthaiThin', `url(${fontPath}/DX-Krungthai-Thin.woff)`),
            new FontFace('DXSCB', `url(${fontPath}/DX-SCB.woff)`),
            new FontFace('DXTTBBold', `url(${fontPath}/DX-TTB-bold.woff)`),
            new FontFace('DXTTBRegular', `url(${fontPath}/DX-TTB-regular.woff)`),
            new FontFace('DXKrungthaiBold', `url(${fontPath}/DX-Krungthai-Bold.woff)`),
            new FontFace('DXKrungthaiMedium', `url(${fontPath}/DX-Krungthai-Medium.woff)`),
            new FontFace('DXKrungthaiRegular', `url(${fontPath}/DX-Krungthai-Regular.woff)`),
            new FontFace('TTBMoney', `url(${fontPath}/TTB Money.woff)`),
            new FontFace('CoreSansLight', `url(${fontPath}/Core-Sans-E-W01-35-Light.woff)`),
            new FontFace('CoreSansBold', `url(${fontPath}/Core-Sans-N-65-Bold.woff)`),
            new FontFace('THSarabun', `url(${fontPath}/THSarabun.woff)`),
            new FontFace('kuriousRegular', `url(${fontPath}/kurious-Regular.woff)`),
            new FontFace('kuriousMedium', `url(${fontPath}/kurious-medium.woff)`),
            new FontFace('kuriousSemiBold', `url(${fontPath}/kurious-semibold.woff)`),
            new FontFace('kuriousBold', `url(${fontPath}/kurious-Bold.woff)`)
        ];

        return Promise.all(fonts.map(font => font.load().catch(e => console.warn(e)))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) {
                if (font) document.fonts.add(font);
            });
        });
    }

    function updateMonthAndYear() {
        const today = new Date();
        
        const shortThaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const fullThaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        const day = today.getDate();
        const shortMonth = shortThaiMonths[today.getMonth()];
        const fullMonth = fullThaiMonths[today.getMonth()];
        const year = today.getFullYear() + 543; 

        const monthAndYear = `${shortMonth} ${year % 100}`;
        const elemMY = document.getElementById('monthandyear');
        if (elemMY && !elemMY.value) elemMY.value = monthAndYear;

        const monthMonthYear = `${day} ${fullMonth} ${year % 100}`;
        const elemMMY = document.getElementById('monthmonthyear');
        if (elemMMY && !elemMMY.value) elemMMY.value = monthMonthYear;
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateMonthAndYear();
        loadFonts().then(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        }).catch(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        });
    });

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        if (!text || text === '-') return;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const paragraphs = text.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const lines = [];
            let currentLine = '';

            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph[i];
                const isThai = /[\u0E00-\u0E7F]/.test(char);
                const isWhitespace = /\s/.test(char);

                if (isThai && !isWhitespace) {
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                    if (maxWidth && testWidth > maxWidth) {
                        lines.push(currentLine.trim());
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                } else {
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                    if (maxWidth && testWidth > maxWidth) {
                        lines.push(currentLine.trim());
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                }
            }

            lines.push(currentLine.trim());

            lines.forEach((line, index) => {
                let currentX = x;
                
                if (align === 'center') {
                    currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
                } else if (align === 'right') {
                    currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                }
                
                drawTextLine(ctx, line, currentX, currentY, letterSpacing);
                currentY += lineHeight > 10 ? lineHeight : fontSize * lineHeight;
                if (maxLines && index >= maxLines - 1) return;
            });
        });
    }

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }

        try {
            const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
            const characters = [...segmenter.segment(text)].map(seg => seg.segment);
            let currentPosition = x;

            characters.forEach((char, index) => {
                const charCode = char.charCodeAt(0);
                const prevChar = index > 0 ? characters[index - 1] : null;

                const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
                const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
                const isBeforeVowel = (charCode === 0x0E31);
                const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

                let yOffset = 0;
                let xOffset = 0;

                if (isUpperVowel) { yOffset = -1; xOffset = 0; }
                if (isToneMark) {
                    if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                        yOffset = -8; xOffset = 0;
                    } else {
                        yOffset = 0; xOffset = -7;
                    }
                }
                if (isBeforeVowel) { yOffset = -1; xOffset = 1; }
                if (isBelowVowel) { yOffset = 0; xOffset = -10; }

                ctx.fillText(char, currentPosition + xOffset, y + yOffset);

                if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
                    currentPosition += ctx.measureText(char).width + letterSpacing;
                } else {
                    currentPosition += ctx.measureText(char).width;
                }
            });
        } catch(e) {
            ctx.fillText(text, x, y);
        }
    }

    function drawBattery(ctx, batteryLevel, powerSavingMode) {
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b'; 
        ctx.fillStyle = '#ffffff'; 

        let batteryColor = '#28bf2b'; 
        if (batteryLevel <= 20) {
            batteryColor = '#ff0000'; 
        } else if (powerSavingMode) {
            batteryColor = '#fccd0e'; 
        }

        const fillWidth = (batteryLevel / 100) * 29.5; 
        const x = 481.0;
        const y = 30.4;
        const height = 12.8;
        const radius = 4; 

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

    const loadImage = (src) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });

    window.updateDisplay = async function() {
        const datetime = document.getElementById('datetime')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        const sendername = document.getElementById('sendername')?.value || '-';
        const senderaccount = document.getElementById('senderaccount')?.value || '-';
        const monthandyear = document.getElementById('monthandyear')?.value || '-';
        const monthmonthyear = document.getElementById('monthmonthyear')?.value || '-';
        const money01 = document.getElementById('money01')?.value || '-';
        
        const bank1 = document.getElementById('bank1')?.value || '-';
        const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
        const name1 = document.getElementById('name1')?.value || '-';
        const bank2 = document.getElementById('bank2')?.value || '-';
        
        const choose1 = document.getElementById('choose1')?.value || '-';
        let money1 = document.getElementById('money1')?.value || '-';
        const time1 = document.getElementById('time1')?.value || '-';
        
        const choose2 = document.getElementById('choose2')?.value || '-';
        let money2 = document.getElementById('money2')?.value || '-';
        const time2 = document.getElementById('time2')?.value || '-';
        
        const choose3 = document.getElementById('choose3')?.value || '-';
        let money3 = document.getElementById('money3')?.value || '-';
        const time3 = document.getElementById('time3')?.value || '-';
        
        const choose4 = document.getElementById('choose4')?.value || '-';
        let money4 = document.getElementById('money4')?.value || '-';
        const time4 = document.getElementById('time4')?.value || '-';
        
        const choose5 = document.getElementById('choose5')?.value || '-';
        let money5 = document.getElementById('money5')?.value || '-';

        const manageSign = (chooseVal, moneyVal) => {
            let cleanMoney = moneyVal.replace(/-/g, '');
            if (chooseVal === 'โอนเงิน') return '-' + cleanMoney;
            return cleanMoney;
        };

        money1 = manageSign(choose1, money1);
        if(document.getElementById('money1')) document.getElementById('money1').value = money1;

        money2 = manageSign(choose2, money2);
        if(document.getElementById('money2')) document.getElementById('money2').value = money2;

        money3 = manageSign(choose3, money3);
        if(document.getElementById('money3')) document.getElementById('money3').value = money3;

        money4 = manageSign(choose4, money4);
        if(document.getElementById('money4')) document.getElementById('money4').value = money4;

        money5 = manageSign(choose5, money5);
        if(document.getElementById('money5')) document.getElementById('money5').value = money5;

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const bgImg = await loadImage('assets/image/bs/background-Depositkbank1.jpg');

        if (bgImg) {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            canvas.width = 555;
            canvas.height = 1213;
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const getTextColor = (chooseVal) => chooseVal === 'โอนเงิน' ? '#d74738' : '#45c2b1';

        drawText(ctx, `${datetime}`, 63.4, 45.8, 22.50, 'SFThonburiSemiBold', '#ffffff', 'left', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `${sendername}`, 122.8, 150.2, 26.07, 'kuriousMedium', '#45c2b1', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount}`, 122.8, 175.9, 19.65, 'kuriousMedium', '#ffffff', 'left', 50, 3, 0, 0, 400, 0);
        drawText(ctx, `${monthandyear}`, 20.6, 423.9, 21.00, 'kuriousBold', '#555555', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${monthmonthyear}`, 20.6, 478.2, 23.45, 'kuriousBold', '#555555', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${money01}`, 534, 201.8, 18, 'kuriousSemiBold', '#ffffff', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money01}`, 534, 229.1, 18, 'kuriousSemiBold', '#ffffff', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `ข้อมูล ณ เวลา ${time1} น.`, 534, 259.1, 16.08, 'kuriousMedium', '#b3b3b3', 'right', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `${choose1}`, 20.6, 546.0, 19.56, 'kuriousMedium', '#4d4d4d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money1} บาท`, 534, 546.0, 19.65, 'kuriousMedium', getTextColor(choose1), 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${time1} น.`, 20.6, 582.5, 16.30, 'kuriousMedium', '#808080', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${bank1}`, 20.6, 650, 20.65, 'kuriousBold', '#4d4d4d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount1}`, 534, 678.9, 19.65, 'kuriousSemiBold', '#4d4d4d', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${name1}`, 534, 711.3, 19.65, 'kuriousSemiBold', '#4d4d4d', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${bank2}`, 534, 743.7, 19.65, 'kuriousSemiBold', '#4d4d4d', 'right', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `${choose2}`, 20.6, 911.6, 19.65, 'kuriousMedium', '#4d4d4d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money2} บาท`, 534, 911.6, 19.65, 'kuriousMedium', getTextColor(choose2), 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${time2} น.`, 20.6, 948.3, 16.30, 'kuriousMedium', '#808080', 'left', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `${choose3}`, 20.6, 1029, 19.65, 'kuriousMedium', '#4d4d4d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money3} บาท`, 534, 1029, 19.65, 'kuriousMedium', getTextColor(choose3), 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${time3} น.`, 20.6, 1066, 16.30, 'kuriousMedium', '#808080', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose4}`, 20.6, 1148.2, 19.65, 'kuriousMedium', '#4d4d4d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money4} บาท`, 534, 1148.2, 19.65, 'kuriousMedium', getTextColor(choose4), 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${time4} น.`, 20.6, 1184.9, 16.30, 'kuriousMedium', '#808080', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose5}`, 20.6, 1250.1, 19.65, 'kuriousMedium', '#4d4d4d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money5} บาท`, 534, 1250.1, 19.65, 'kuriousMedium', getTextColor(choose5), 'right', 1.5, 3, 0, 0, 800, 0);

        const isPowerSavingMode = typeof powerSavingMode !== 'undefined' ? powerSavingMode : false;
        drawBattery(ctx, batteryLevel, isPowerSavingMode);
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_kbank1.png';
        link.click();
    };

})();