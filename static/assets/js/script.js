// Navigation functionality
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    if (scrollY > 50) {
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Feature cards animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
            featureObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    featureObserver.observe(card);
});

// Check login state from sessionStorage (clears when tab closes)
let isLoggedIn = sessionStorage.getItem('smartIDSLoggedIn') === 'true';

function refreshLoginState() {
    // Check sessionStorage first, then fallback to localStorage for backward compatibility
    isLoggedIn = sessionStorage.getItem('smartIDSLoggedIn') === 'true' || 
                 localStorage.getItem('smartIDSLoggedIn') === 'true';
    
    // If found in localStorage but not sessionStorage, clear it (force re-login)
    if (localStorage.getItem('smartIDSLoggedIn') === 'true' && !sessionStorage.getItem('smartIDSLoggedIn')) {
        localStorage.removeItem('smartIDSLoggedIn');
        localStorage.removeItem('smartIDSCurrentUser');
        isLoggedIn = false;
    }
}

// function ensureLoginForUpload() {
//     refreshLoginState();
//     if (isLoggedIn) {
//         return true;
//     }
//     alert('Please login first to upload files.');
//     setTimeout(() => {
//         window.location.href = 'login.html';
//     }, 300);
//     return false;
// }

// // CSV File Upload functionality
// const uploadArea = document.getElementById('upload-area');
// const fileInput = document.getElementById('file-input');
// const browseBtn = document.getElementById('browse-btn');
// const directUploadBtn = document.getElementById('direct-upload-btn');
// const fileInfo = document.getElementById('file-info');
// const fileName = document.getElementById('file-name');
// const fileSize = document.getElementById('file-size');
// const fileRemove = document.getElementById('file-remove');
// const uploadProgress = document.getElementById('upload-progress');
// const progressFill = document.getElementById('progress-fill');
// const progressText = document.getElementById('progress-text');
// const processBtn = document.getElementById('process-btn');
// let selectedFile = null;

// if (uploadArea && fileInput && browseBtn && directUploadBtn && fileInfo && fileName && fileSize && fileRemove && uploadProgress && progressFill && progressText && processBtn) {
//     // Direct upload button click
//     directUploadBtn.addEventListener('click', () => {
//         if (!ensureLoginForUpload()) return;
//         fileInput.click();
//     });

//     // Browse button click
//     browseBtn.addEventListener('click', (e) => {
//         e.stopPropagation();
//         if (!ensureLoginForUpload()) return;
//         fileInput.click();
//     });

//     // Upload area click (make entire area clickable)
//     uploadArea.addEventListener('click', (e) => {
//         // Don't trigger if clicking on the browse button
//         if (e.target !== browseBtn && !browseBtn.contains(e.target)) {
//             if (!ensureLoginForUpload()) return;
//             fileInput.click();
//         }
//     });

//     // File input change
//     fileInput.addEventListener('change', (e) => {
//         handleFile(e.target.files[0]);
//     });

//     // Drag and drop functionality
//     uploadArea.addEventListener('dragover', (e) => {
//         e.preventDefault();
//         uploadArea.classList.add('drag-over');
//     });

//     uploadArea.addEventListener('dragleave', () => {
//         uploadArea.classList.remove('drag-over');
//     });

//     uploadArea.addEventListener('drop', (e) => {
//         e.preventDefault();
//         uploadArea.classList.remove('drag-over');
        
//         if (!ensureLoginForUpload()) return;

//         const files = e.dataTransfer.files;
//         if (files.length > 0) {
//             const file = files[0];
//             if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
//                 handleFile(file);
//             } else {
//                 alert('Please upload a CSV file only.');
//             }
//         }
//     });

//     // Handle file selection
//     function handleFile(file) {
//         refreshLoginState();
//         if (!isLoggedIn) {
//             return;
//         }
//         if (!file) return;

//         selectedFile = file;
        
//         // Display file info
//         fileName.textContent = file.name;
//         fileSize.textContent = formatFileSize(file.size);
//         fileInfo.style.display = 'block';
//         processBtn.style.display = 'block';
        
//         // Hide upload content
//         document.querySelector('.upload-content').style.display = 'none';
        
//         // Simulate upload progress
//         simulateUpload();
//     }

//     // Format file size
//     function formatFileSize(bytes) {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
//     }

//     // Simulate upload progress
//     function simulateUpload() {
//         uploadProgress.style.display = 'block';
//         progressFill.style.width = '0%';
//         progressText.textContent = 'Uploading...';
        
//         let progress = 0;
//         const interval = setInterval(() => {
//             progress += Math.random() * 15;
//             if (progress >= 100) {
//                 progress = 100;
//                 clearInterval(interval);
//                 progressText.textContent = 'Upload complete!';
//                 setTimeout(() => {
//                     uploadProgress.style.display = 'none';
//                 }, 1000);
//             } else {
//                 progressFill.style.width = progress + '%';
//                 progressText.textContent = `Uploading... ${Math.round(progress)}%`;
//             }
//         }, 200);
//     }

//     // Remove file
//     fileRemove.addEventListener('click', () => {
//         selectedFile = null;
//         fileInfo.style.display = 'none';
//         processBtn.style.display = 'none';
//         document.querySelector('.upload-content').style.display = 'block';
//         fileInput.value = '';
//     });

//     // Process file button
//     processBtn.addEventListener('click', () => {
//         if (!ensureLoginForUpload()) return;

//         if (!selectedFile) {
//             alert('Please select a file first.');
//             return;
//         }
        
//         processBtn.textContent = 'Processing...';
//         processBtn.disabled = true;
        
//         // Simulate processing
//         setTimeout(() => {
//             alert(`File "${selectedFile.name}" processed successfully! Redirecting to the prediction page...`);
//             processBtn.textContent = 'Process File';
//             processBtn.disabled = false;
//             setTimeout(() => {
//                 window.location.href = 'prediction.html';
//             }, 500);
//         }, 2000);
//     });
// }

// Animate stats on scroll
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('.about-section');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = stat.textContent;
        const isNumber = target.match(/\d+/);
        
        if (isNumber) {
            const finalValue = target;
            let currentValue = 0;
            const increment = target.includes('K') ? 100 : 
                            target.includes('%') ? 1 : 
                            target.includes('/') ? 1 : 1;
            const duration = 2000;
            const stepTime = duration / (parseInt(target) / increment);
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= parseInt(target)) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    if (target.includes('K')) {
                        stat.textContent = (currentValue / 1000).toFixed(1) + 'K+';
                    } else if (target.includes('%')) {
                        stat.textContent = currentValue.toFixed(1) + '%';
                    } else {
                        stat.textContent = currentValue;
                    }
                }
            }, stepTime);
        }
    });
}

// Add smooth scroll behavior for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Console welcome message
// console.log('%c🧠 Smart Instruction Detection System', 'color: #667eea; font-size: 20px; font-weight: bold;');
// console.log('%cWelcome! This is a modern web application for intelligent instruction analysis.', 'color: #764ba2; font-size: 14px;');

