import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const particleTexture = textureLoader.load('/textures/particles/1.png')
const matcapFiles = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
const matcapTextures = matcapFiles
    .map(textureNum => textureLoader.load(`/textures/matcaps/${textureNum}.png`))

/**
 * Base
 */
// Object
const geometry = new THREE.TorusKnotGeometry(10, 1, 100, 16)
const material = new THREE.MeshNormalMaterial()
const torusKnot = new THREE.Mesh(geometry, material);

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.map = particleTexture
particlesMaterial.size = 0.3
particlesMaterial.sizeAttenuation = true
const particles = new THREE.Points(geometry, particlesMaterial)

// Debug
const parameters = {
    material: "0",
    particles: false
}

const gui = new GUI()
gui.add(parameters, 'material', ['0', ...matcapFiles])
    .onChange(v => {
        torusKnot.material.dispose()
        particles.material.dispose()
        if (v === '0') {
            torusKnot.material = new THREE.MeshNormalMaterial()
            torusKnot.material = new THREE.PointsMaterial()
            particlesMaterial.map = particleTexture
            particlesMaterial.size = 0.3
            particlesMaterial.sizeAttenuation = true
        } else {
            torusKnot.material = new THREE.MeshMatcapMaterial({ matcap: matcapTextures[parseInt(v) - 1] })
            particlesMaterial.map = matcapTextures[parseInt(v) - 1]
            particlesMaterial.size = 0.3
            particlesMaterial.sizeAttenuation = true
        }
    })
gui.add(parameters, 'particles')
    .onChange(showParticles => {
        if (showParticles) {
            scene.remove(torusKnot)
            scene.add(particles)
        } else {
            scene.remove(particles)
            scene.add(torusKnot)
        }
    })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.add(torusKnot);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 12
scene.add(camera)
geometry.computeBoundingSphere()
camera.position.z = geometry.boundingSphere.radius * 1.5

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let interval = .3
let seconds = interval
let increment = true
let p = 2
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    if (elapsedTime > seconds) {
        seconds += interval
        if (increment) {
            p++
            if (p === 30) increment = false
        } else {
            p--
            if (p === 1) increment = true
        }
        const q = Math.random() * p
        torusKnot.geometry.dispose()
        particles.geometry.dispose()
        torusKnot.geometry = new THREE.TorusKnotGeometry(10, 1, 100, 16, p, q)
        particles.geometry = new THREE.TorusKnotGeometry(10, 1, 100, 16, p, q)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()