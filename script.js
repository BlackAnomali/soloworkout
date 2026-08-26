// --- Inisialisasi Scene, Camera, & Renderer ---
const container = document.getElementById('webgl-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Mencegah halaman web ikut terscroll saat pengguna sedang memutar model 3D pakai sentuhan jari di HP
container.style.touchAction = 'none';

// --- Kontrol Orbit (Rotasi 360 & Zoom) ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 8;

// --- Fitur Auto-Rotate Pintar ---
let isUserInteracting = false;
let resumeTimer = null;

// Saat pengguna mulai mengklik / menggeser / memutar model
controls.addEventListener('start', () => {
    isUserInteracting = true;
    if (resumeTimer) clearTimeout(resumeTimer);
});

// Saat pengguna selesai menggeser model
controls.addEventListener('end', () => {
    // Berikan jeda 3 detik sebelum model mulai berputar otomatis lagi
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
        isUserInteracting = false;
    }, 3000); 
});

// --- Pencahayaan Bertema Biru Futuristik ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
directionalLight1.position.set(2, 4, 3);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0x0284c7, 1.0);
directionalLight2.position.set(-2, -1, -3);
scene.add(directionalLight2);

// --- Database Lengkap Data Otot & Latihan ---
// Catatan: Koordinat (x, y, z) bisa disesuaikan sedikit nanti jika model 3D-mu punya proporsi berbeda.
const muscleData = [
    // --- TAMPAK DEPAN (ANTERIOR) ---
    {
        id: 'chest',
        name: 'PECTORALS (DADA)',
        position: { x: 0.0, y: 0.5, z: 0.12 },
        side: 'front',
        workouts: ['- Bench Press', '- Push-up', '- Incline Dumbbell Press']
    },
    {
        id: 'biceps',
        name: 'BICEPS (LENGAN DEPAN)',
        position: { x: 0.28, y: 0.4, z: -0.01 },
        side: 'front',
        workouts: ['- Barbell Curl', '- Hammer Curl', '- Concentration Curl']
    },
    {
        id: 'abs',
        name: 'RECTUS ABDOMINIS (PERUT)',
        position: { x: 0.0, y: 0.2, z: 0.12 },
        side: 'front',
        workouts: ['- Crunch', '- Leg Raise', '- Plank']
    },
    {
        id: 'quads',
        name: 'QUADRICEPS (PAHA DEPAN)',
        position: { x: 0.12, y: -0.1, z: 0.1

         },
        side: 'front',
        workouts: ['- Barbell Squat', '- Leg Press', '- Lunges']
    },
    {
        id: 'front_delts',
        name: 'DELTOIDS (BAHU DEPAN)',
        position: { x: 0.25, y: 0.6, z: -0.1 },
        side: 'front',
        workouts: ['- Overhead Press', '- Front Raise']
    },

    // --- TAMPAK SAMPING (LATERAL) ---
    {
        id: 'side_delts',
        name: 'DELTOIDS (BAHU SAMPING)',
        position: { x: 0.3, y: 0.45, z: -0.1 },
        side: 'lateral',
        workouts: ['- Lateral Raise', '- Upright Row']
    },
    {
        id: 'forearms',
        name: 'FOREARMS (LENGAN BAWAH)',
        position: { x: 0.5, y: 0.15, z: 0.1 },
        side: 'lateral',
        workouts: ['- Wrist Curl', '- Farmer\'s Walk']
    },
    {
        id: 'obliques',
        name: 'OBLIQUES (PERUT SAMPING)',
        position: { x: 0.16, y: 0.1, z: 0.05 },
        side: 'lateral',
        workouts: ['- Russian Twist', '- Side Plank']
    },

    // --- TAMPAK BELAKANG (POSTERIOR) ---
    {
        id: 'traps',
        name: 'TRAPEZIUS (PUNGGUNG ATAS)',
        position: { x: 0.0, y: 0.55, z: -0.08 },
        side: 'back',
        workouts: ['- Barbell Shrug', '- Face Pull']
    },
    {
        id: 'lats',
        name: 'LATISSIMUS DORSI (PUNGGUNG)',
        position: { x: 0.0, y: 0.3, z: -0.12 },
        side: 'back',
        workouts: ['- Pull-up', '- Lat Pulldown', '- Barbell Row']
    },
    {
        id: 'triceps',
        name: 'TRICEPS (LENGAN BELAKANG)',
        position: { x: -0.26, y: 0.4, z: -0.1 },
        side: 'back',
        workouts: ['- Tricep Pushdown', '- Skull Crusher', '- Dips']
    },
    {
        id: 'glutes',
        name: 'GLUTES (BOKONG)',
        position: { x: 0.1, y: -0.15, z: -0.12 },
        side: 'back',
        workouts: ['- Hip Thrust', '- Romanian Deadlift']
    },
    {
        id: 'hamstrings_calves',
        name: 'HAMSTRINGS & CALVES (PAHA/BETIS BELAKANG)',
        position: { x: 0.12, y: -0.45, z: -0.1 },
        side: 'back',
        workouts: ['- Leg Curl', '- Standing Calf Raise']
    }
];

// Array untuk menyimpan objek mesh marker di scene 3D
const markerObjects = [];

// --- Memuat Model 3D (.glb) ---
const loader = new THREE.GLTFLoader();
let model3D = null;

loader.load(
    './model.glb',
    function (gltf) {
        model3D = gltf.scene;
        scene.add(model3D);
        model3D.position.set(0, 0, 0); 
        
        // Buat semua marker setelah model berhasil dimuat
        createHotspotMarkers();
        console.log("Model 3D & Semua Hotspot Otot Berhasil Dimuat!");
    },
    undefined,
    function (error) {
        console.error('Gagal memuat model 3D:', error);
    }
);

// --- Fungsi Membuat Hotspot Marker 3D ---
const markerGroup = new THREE.Group();

function createHotspotMarkers() {
    // Menggunakan wajik/berlian segi delapan (Octahedron)
    const geometry = new THREE.OctahedronGeometry(0.035, 0); 
    
    muscleData.forEach((data) => {
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x38bdf8,
            wireframe: true,  // <--- KUNCI ESTETIKANYA DI SINI (Hanya render garis tepi)
            depthTest: false, 
            transparent: true,
            opacity: 0.9
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(data.position.x, data.position.y, data.position.z);
        
        marker.userData = data;
        marker.renderOrder = 999; 
        
        model3D.add(marker);
        markerObjects.push(marker);
    });
}

// --- Logika Interaksi UI & Raycaster ---
const hotspotLabel = document.getElementById('hotspot-label');
const muscleTitle = document.getElementById('muscle-title');
const viewMoreBtn = document.getElementById('view-more-btn');
const detailPanel = document.getElementById('detail-panel');
const closePanelBtn = document.getElementById('close-panel-btn');
const workoutList = document.getElementById('workout-list');
const panelMuscleName = document.getElementById('panel-muscle-name');

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hideTimer = null;
let activeMuscleData = null;

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (markerObjects.length > 0) {
        // Hanya cek marker yang sedang aktif/tampak di layar
        const visibleMarkers = markerObjects.filter(m => m.visible);
        const intersects = raycaster.intersectObjects(visibleMarkers);

        if (intersects.length > 0) {
            const clickedMarker = intersects[0].object;
            activeMuscleData = clickedMarker.userData;

            muscleTitle.textContent = activeMuscleData.name;

            if (hideTimer) {
                clearTimeout(hideTimer);
            }

            hotspotLabel.classList.remove('hidden');
            hotspotLabel.classList.remove('fade-out');

            hideTimer = setTimeout(() => {
                hotspotLabel.classList.add('fade-out');
            }, 5000);
            
            return;
        }
    }
});

viewMoreBtn.addEventListener('click', () => {
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
    hotspotLabel.classList.add('fade-out');

    if (activeMuscleData) {
        panelMuscleName.textContent = activeMuscleData.name;
        workoutList.innerHTML = '';
        activeMuscleData.workouts.forEach(w => {
            const li = document.createElement('li');
            li.textContent = w;
            workoutList.appendChild(li);
        });
    }

    detailPanel.classList.remove('hidden');
});

closePanelBtn.addEventListener('click', () => {
    detailPanel.classList.add('hidden');
});

// --- Logika Vektor Presisi untuk Mengatasi Tembus Pandang ---
const markerWorldPos = new THREE.Vector3();
const camWorldPos = new THREE.Vector3();
const dirToCamera = new THREE.Vector3();
const markerNormal = new THREE.Vector3();

function updateMarkerVisibility() {
    if (!model3D) return;

    camera.getWorldPosition(camWorldPos);

    markerObjects.forEach(marker => {
        marker.getWorldPosition(markerWorldPos);
        dirToCamera.subVectors(camWorldPos, markerWorldPos).normalize();

        const side = marker.userData.side;
        
        // Tentukan arah normal berdasarkan posisi/sisi marker
        if (side === 'front') {
            markerNormal.set(0, 0, 1).applyQuaternion(model3D.quaternion);
        } else if (side === 'back') {
            markerNormal.set(0, 0, -1).applyQuaternion(model3D.quaternion);
        } else if (side === 'lateral') {
            markerNormal.copy(marker.position).normalize();
            markerNormal.y = 0;
            markerNormal.applyQuaternion(model3D.quaternion);
        }

        // Hitung sudut hadap menggunakan Dot Product
        const dot = markerNormal.dot(dirToCamera);

        // Jika marker sedang menghadap ke arah layar (kamera), tampilkan. 
        // Jika sedang berputar ke sisi sebaliknya, sembunyikan agar tidak tembus pandang.
        if (side === 'lateral') {
            marker.visible = Math.abs(dot) < 0.6;
        } else if (side === 'back') {
            marker.visible = dot > -0.05; // Toleransi longgar untuk punggung bawah/atas
        } else {
            marker.visible = dot > 0.1;   // Bagian depan
        }
    });
}



// --- Responsive Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Loop Animasi Render ---
function animate() {
    requestAnimationFrame(animate);
    
    if (!isUserInteracting && model3D) {
        model3D.rotation.y -= 0.03; 
    }

    // Animasi putar berlian
    markerObjects.forEach(marker => {
        marker.rotation.y += 0.02; 
    });

    controls.update();
    updateMarkerVisibility(); // <--- Pastikan fungsi ini dipanggil di sini!
    renderer.render(scene, camera);
}

animate();