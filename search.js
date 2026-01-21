import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBE17HLiCalOIQ4zl_dAB6puEJfkzNNS6E",
  authDomain: "fpt-networking.firebaseapp.com",
  projectId: "fpt-networking",
  storageBucket: "fpt-networking.firebasestorage.app",
  messagingSenderId: "201478100529",
  appId: "1:201478100529:web:28000930b4a05bc7cce710",
  measurementId: "G-2EVXH4LCSP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ==========================================================================
   REMOVE VIETNAMESE TONES
   ========================================================================== */
function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

/* ==========================================================================
   HIGHLIGHT KEYWORD
   ========================================================================== */
function highlightText(text, keyword) {
    if (!text || !keyword) return text || "";
    
    const keywordParts = keyword.toLowerCase().split(" ").filter(k => k.trim() !== "");
    let result = text;

    keywordParts.forEach(part => {
        const regex = new RegExp(`(${part})`, "gi");
        result = result.replace(regex, match => `<mark>${match}</mark>`);
    });

    return result;
}

/* ==========================================================================
   GET KEYWORD FROM URL
   ========================================================================== */
const urlParams = new URLSearchParams(window.location.search);
let keyword = (urlParams.get("q") || "").trim();
let keywordNoSign = removeVietnameseTones(keyword);

// Set keyword in input field
document.getElementById("searchInput").value = keyword;

/* ==========================================================================
   ENTER TO SEARCH
   ========================================================================== */
document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
});

/* ==========================================================================
   SEARCH REDIRECT
   ========================================================================== */
window.executeSearch = function() {
    const input = document.getElementById("searchInput").value.trim();
    if (!input) return;
    window.location.href = `search.html?q=${encodeURIComponent(input)}`;
}

/* ==========================================================================
   MAIN SEARCH FUNCTION
   ========================================================================== */
async function search() {
    const resultsDiv = document.getElementById("results");

    // Show loading spinner
    resultsDiv.innerHTML = `<div class="loader"></div>`;

    try {
        // Get data from Firestore
        const snap = await getDocs(collection(db, "filequestions"));
        let results = [];

        snap.forEach(doc => {
            const data = doc.data();
            let question = data.question || "";
            let questionNoSign = removeVietnameseTones(question);

            // Split keyword into words
            let words = keywordNoSign.split(" ").filter(w => w.length > 0);

            // Match: all words must be in question (without tones)
            let match = words.every(w => questionNoSign.includes(w));

            if (match) results.push(data);
        });

        /* ==========================================================================
           NO RESULT UI
           ========================================================================== */
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="no-result">❌ Không tìm thấy kết quả cho: <b>"${keyword}"</b></div>
            `;
            return;
        }

        /* ==========================================================================
           DISPLAY RESULTS WITH HIGHLIGHT + ANIMATION
           ========================================================================== */
        resultsDiv.innerHTML = results.map(item => `
            <div class="qa-item" style="animation: fadeIn 0.3s ease;">
                
                <div class="qa-avatar">
                    <i class='bx bxs-user-circle'></i>
                </div>

                <div class="qa-main">
                    <div class="qa-top">
                        <h3 class="qa-question">${highlightText(item.question, keyword)}</h3>
                        <span class="qa-badge">ĐÃ GIẢI ĐÁP</span>
                    </div>

                    <p class="qa-info">📁 ${item.category || "Khác"}</p>

                    <div class="qa-answer">
                        ${highlightText(item.answer || "Chưa có câu trả lời.", keyword)}
                    </div>
                </div>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error fetching data:", error);
        resultsDiv.innerHTML = `
            <div class="no-result">❌ Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!</div>
        `;
    }
}

// Run search immediately when page loads
if (keyword) {
    search();
} else {
    document.getElementById("results").innerHTML = `
        <div class="no-result">🔍 Nhập từ khóa để tìm kiếm câu hỏi</div>
    `;
}