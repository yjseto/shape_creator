let scene, camera, renderer, shape, axes;
let currentShape = 'sphere';
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(document.getElementById('canvas-container').clientWidth, 400);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    camera.position.z = 5;

    createShape();
    animate();

    window.addEventListener('resize', onWindowResize, false);
    
    // Add event listeners for mouse-based rotation
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mouseleave', onMouseUp, false);

    // Add event listener for scroll-based zooming
    renderer.domElement.addEventListener('wheel', onMouseWheel, false);
}

function createShape() {
    if (shape) {
        scene.remove(shape);
    }
    if (axes) {
        scene.remove(axes);
    }

    let geometry;
    switch (currentShape) {
        case 'sphere':
            const radius = parseFloat(document.getElementById('sphere-radius').value);
            geometry = new THREE.SphereGeometry(radius, 32, 32);
            break;
        case 'rectangular-prism':
            const width = parseFloat(document.getElementById('prism-width').value);
            const height = parseFloat(document.getElementById('prism-height').value);
            const depth = parseFloat(document.getElementById('prism-depth').value);
            geometry = new THREE.BoxGeometry(width, height, depth);
            break;
        case 'cylinder':
            const cylinderRadius = parseFloat(document.getElementById('cylinder-radius').value);
            const cylinderHeight = parseFloat(document.getElementById('cylinder-height').value);
            geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32);
            break;
    }

    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    // Add axes
    axes = new THREE.AxesHelper(Math.max(shape.geometry.parameters.width, shape.geometry.parameters.height, shape.geometry.parameters.depth) * 0.6);
    shape.add(axes);

    updateShapeInfo();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.getElementById('canvas-container').clientWidth, 400);
}

function updateShapeInfo() {
    let volume, surfaceArea;
    switch (currentShape) {
        case 'sphere':
            const radius = parseFloat(document.getElementById('sphere-radius').value);
            volume = (4/3) * Math.PI * Math.pow(radius, 3);
            surfaceArea = 4 * Math.PI * Math.pow(radius, 2);
            break;
        case 'rectangular-prism':
            const width = parseFloat(document.getElementById('prism-width').value);
            const height = parseFloat(document.getElementById('prism-height').value);
            const depth = parseFloat(document.getElementById('prism-depth').value);
            volume = width * height * depth;
            surfaceArea = 2 * (width * height + width * depth + height * depth);
            break;
        case 'cylinder':
            const cylinderRadius = parseFloat(document.getElementById('cylinder-radius').value);
            const cylinderHeight = parseFloat(document.getElementById('cylinder-height').value);
            volume = Math.PI * Math.pow(cylinderRadius, 2) * cylinderHeight;
            surfaceArea = 2 * Math.PI * cylinderRadius * (cylinderRadius + cylinderHeight);
            break;
    }

    document.getElementById('volume-info').textContent = `Volume: ${volume.toFixed(2)}`;
    document.getElementById('surface-area-info').textContent = `Surface Area: ${surfaceArea.toFixed(2)}`;
}

document.getElementById('shape-select').addEventListener('change', (e) => {
    currentShape = e.target.value;
    createShape();
    document.querySelectorAll('.shape-controls').forEach(el => el.classList.remove('active'));
    document.getElementById(`${currentShape}-controls`).classList.add('active');
});

document.getElementById('resize-btn').addEventListener('click', () => {
    document.getElementById('dimension-controls').classList.remove('hidden');
    document.getElementById('color-controls').classList.add('hidden');
    updateActiveButton('resize-btn');
});

document.getElementById('color-btn').addEventListener('click', () => {
    document.getElementById('dimension-controls').classList.add('hidden');
    document.getElementById('color-controls').classList.remove('hidden');
    updateActiveButton('color-btn');
});

function updateActiveButton(activeId) {
    document.querySelectorAll('.interaction-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(activeId).classList.add('active');
}

document.getElementById('color-picker').addEventListener('change', (e) => {
    shape.material.color.setHex(parseInt(e.target.value.substr(1), 16));
});

['sphere-radius', 'prism-width', 'prism-height', 'prism-depth', 'cylinder-radius', 'cylinder-height'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        createShape();
    });
});

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    const rotationSpeed = 0.005;

    shape.rotation.y += deltaMove.x * rotationSpeed;
    shape.rotation.x += deltaMove.y * rotationSpeed;

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp(event) {
    isDragging = false;
}

function onMouseWheel(event) {
    event.preventDefault();

    const zoomSpeed = 0.1;
    const minZoom = 1;
    const maxZoom = 10;

    // Determine zoom direction
    const zoomAmount = event.deltaY > 0 ? zoomSpeed : -zoomSpeed;

    // Update camera position
    camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z + zoomAmount));

    // Update camera
    camera.updateProjectionMatrix();
}

init();