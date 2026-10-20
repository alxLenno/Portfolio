import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const gold = 0xd4af37
const maroon = 0x7a1625

function makeChipTexture(renderer) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 480
  const context = canvas.getContext('2d')

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  background.addColorStop(0, '#66111f')
  background.addColorStop(0.52, '#29080e')
  background.addColorStop(1, '#160407')
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.strokeStyle = 'rgba(232, 205, 122, 0.28)'
  context.lineWidth = 3
  for (let index = 0; index < 6; index += 1) {
    const y = 52 + index * 76
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(110 + index * 16, y)
    context.lineTo(152 + index * 16, y + 28)
    context.stroke()
  }

  context.fillStyle = '#f4e7b7'
  context.textAlign = 'center'
  context.font = '700 122px Inter, Arial, sans-serif'
  context.fillText('LKK', canvas.width / 2, 215)
  context.fillStyle = '#d4af37'
  context.font = '700 32px Inter, Arial, sans-serif'
  context.letterSpacing = '5px'
  context.fillText('ENGINEERING SYSTEMS', canvas.width / 2, 292)

  context.fillStyle = 'rgba(244, 231, 183, 0.82)'
  context.font = '600 22px ui-monospace, monospace'
  context.letterSpacing = '1px'
  context.fillText('EMBEDDED  ·  IoT  ·  APPLIED AI', canvas.width / 2, 354)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  return texture
}

function addTrace(group, material, points) {
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index]
    const end = points[index + 1]
    const width = Math.max(Math.abs(end.x - start.x), 0.045)
    const depth = Math.max(Math.abs(end.z - start.z), 0.045)
    const segment = new THREE.Mesh(new THREE.BoxGeometry(width, 0.025, depth), material)
    segment.position.set((start.x + end.x) / 2, 0.15, (start.z + end.z) / 2)
    segment.castShadow = true
    group.add(segment)
  }
}

export default function HeroScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
    } catch {
      mount.dataset.webgl = 'unavailable'
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.domElement.className = 'hero-webgl__canvas'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(6.7, 5.25, 7.3)
    camera.lookAt(0, 0.2, 0)

    const rig = new THREE.Group()
    rig.rotation.set(-0.04, -0.24, 0.015)
    scene.add(rig)

    const boardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x28080e,
      metalness: 0.18,
      roughness: 0.56,
      clearcoat: 0.52,
      clearcoatRoughness: 0.3,
    })
    const board = new THREE.Mesh(new RoundedBoxGeometry(5.9, 0.22, 3.8, 5, 0.09), boardMaterial)
    board.receiveShadow = true
    board.castShadow = true
    rig.add(board)

    const boardInset = new THREE.Mesh(
      new RoundedBoxGeometry(5.62, 0.025, 3.52, 4, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x420c16,
        metalness: 0.08,
        roughness: 0.72,
      }),
    )
    boardInset.position.y = 0.122
    boardInset.receiveShadow = true
    rig.add(boardInset)

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: gold,
      metalness: 0.92,
      roughness: 0.22,
    })
    const traceMaterial = new THREE.MeshStandardMaterial({
      color: 0xb98c26,
      emissive: 0x3c2703,
      emissiveIntensity: 0.28,
      metalness: 0.86,
      roughness: 0.24,
    })

    const chip = new THREE.Mesh(
      new RoundedBoxGeometry(2.28, 0.48, 1.68, 6, 0.11),
      new THREE.MeshPhysicalMaterial({
        color: 0x170407,
        metalness: 0.34,
        roughness: 0.25,
        clearcoat: 0.82,
        clearcoatRoughness: 0.16,
      }),
    )
    chip.position.y = 0.38
    chip.castShadow = true
    rig.add(chip)

    const chipTexture = makeChipTexture(renderer)
    const chipLabelMaterial = new THREE.MeshBasicMaterial({
      map: chipTexture,
      toneMapped: false,
      side: THREE.FrontSide,
    })
    const chipLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.98, 1.4),
      chipLabelMaterial,
    )
    chipLabel.rotation.x = -Math.PI / 2
    chipLabel.position.y = 0.626
    rig.add(chipLabel)

    const sidePinGeometry = new RoundedBoxGeometry(0.46, 0.08, 0.1, 2, 0.025)
    const endPinGeometry = new RoundedBoxGeometry(0.1, 0.08, 0.4, 2, 0.025)
    for (let index = 0; index < 7; index += 1) {
      const z = -0.66 + index * 0.22
      for (const x of [-1.3, 1.3]) {
        const pin = new THREE.Mesh(sidePinGeometry, metalMaterial)
        pin.position.set(x, 0.31, z)
        pin.castShadow = true
        rig.add(pin)
      }
    }
    for (let index = 0; index < 8; index += 1) {
      const x = -0.84 + index * 0.24
      for (const z of [-1.02, 1.02]) {
        const pin = new THREE.Mesh(endPinGeometry, metalMaterial)
        pin.position.set(x, 0.31, z)
        pin.castShadow = true
        rig.add(pin)
      }
    }

    const tracePaths = [
      [{ x: 1.14, z: 0.56 }, { x: 1.82, z: 0.56 }, { x: 1.82, z: 1.36 }, { x: 2.6, z: 1.36 }],
      [{ x: 1.14, z: 0.18 }, { x: 2.38, z: 0.18 }, { x: 2.38, z: 0.82 }, { x: 2.72, z: 0.82 }],
      [{ x: 1.14, z: -0.25 }, { x: 1.72, z: -0.25 }, { x: 1.72, z: -1.2 }, { x: 2.52, z: -1.2 }],
      [{ x: -1.14, z: 0.5 }, { x: -1.78, z: 0.5 }, { x: -1.78, z: 1.28 }, { x: -2.62, z: 1.28 }],
      [{ x: -1.14, z: 0.05 }, { x: -2.34, z: 0.05 }, { x: -2.34, z: 0.74 }, { x: -2.7, z: 0.74 }],
      [{ x: -1.14, z: -0.42 }, { x: -1.66, z: -0.42 }, { x: -1.66, z: -1.3 }, { x: -2.55, z: -1.3 }],
    ]
    tracePaths.forEach((path) => addTrace(rig, traceMaterial, path))

    const contactGeometry = new THREE.CylinderGeometry(0.075, 0.075, 0.035, 20)
    const contactPositions = [
      [-2.62, 1.36], [2.62, 1.36], [-2.7, 0.74], [2.72, 0.82],
      [-2.55, -1.3], [2.52, -1.2], [-2.55, 1.62], [2.55, -1.62],
    ]
    contactPositions.forEach(([x, z]) => {
      const contact = new THREE.Mesh(contactGeometry, metalMaterial)
      contact.position.set(x, 0.17, z)
      rig.add(contact)
    })

    const componentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x121114,
      metalness: 0.64,
      roughness: 0.3,
      clearcoat: 0.4,
    })
    const componentGeometry = new RoundedBoxGeometry(0.48, 0.28, 0.26, 3, 0.045)
    const componentPositions = [
      [-2.22, 0.6, 0.14], [2.08, -0.62, -0.18], [-1.86, -0.9, 0.08], [2.22, 1.02, 0.22],
    ]
    componentPositions.forEach(([x, z, rotation]) => {
      const component = new THREE.Mesh(componentGeometry, componentMaterial)
      component.position.set(x, 0.29, z)
      component.rotation.y = rotation
      component.castShadow = true
      rig.add(component)
    })

    const capacitorBody = new THREE.MeshStandardMaterial({ color: 0x20252b, metalness: 0.74, roughness: 0.28 })
    const capacitorTop = new THREE.MeshStandardMaterial({ color: 0xa89b7e, metalness: 0.9, roughness: 0.2 })
    const capacitorPositions = [[-2.38, -0.2], [2.38, 0.12], [2.48, -1.5]]
    capacitorPositions.forEach(([x, z]) => {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 24), capacitorBody)
      body.position.set(x, 0.34, z)
      body.castShadow = true
      rig.add(body)
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 24), capacitorTop)
      top.position.set(x, 0.555, z)
      rig.add(top)
    })

    const ledMaterials = [
      new THREE.MeshStandardMaterial({ color: maroon, emissive: 0xff254c, emissiveIntensity: 4 }),
      new THREE.MeshStandardMaterial({ color: 0x1f8a4d, emissive: 0x4ade80, emissiveIntensity: 4 }),
      new THREE.MeshStandardMaterial({ color: gold, emissive: gold, emissiveIntensity: 3 }),
    ]
    const ledPositions = [[-2.5, 1.58], [2.56, 1.58], [2.52, -1.48]]
    const leds = ledPositions.map(([x, z], index) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 12), ledMaterials[index])
      led.position.set(x, 0.25, z)
      rig.add(led)
      return led
    })

    const signalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdc67,
      emissive: gold,
      emissiveIntensity: 5,
      roughness: 0.2,
    })
    const signalCurves = tracePaths.slice(0, 4).map((path) =>
      new THREE.CatmullRomCurve3(path.map(({ x, z }) => new THREE.Vector3(x, 0.205, z))),
    )
    const signals = signalCurves.map((curve, index) => {
      const signal = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 8), signalMaterial)
      signal.userData = { curve, phase: index * 0.23, speed: 0.075 + index * 0.012 }
      rig.add(signal)
      return signal
    })

    // A steady field surrounds the independently draggable circuit board.
    const field = new THREE.Group()
    scene.add(field)
    const fieldPoints = []
    const globeRadius = 3.8
    const fieldCurves = []
    const addGlobeLoop = makePoint => {
      const points = Array.from({ length: 96 }, (_, index) => makePoint(index * Math.PI * 2 / 96))
      fieldPoints.push(...points)
      fieldCurves.push(new THREE.CatmullRomCurve3(points, true))
    }
    // Latitude rings and four meridian planes form a spherical grid.
    for (const latitude of [-60, -30, 0, 30, 60]) {
      const phi = THREE.MathUtils.degToRad(latitude)
      const radius = globeRadius * Math.cos(phi)
      addGlobeLoop(angle => new THREE.Vector3(radius * Math.cos(angle),
        0.2 + globeRadius * Math.sin(phi), radius * Math.sin(angle)))
    }
    for (let meridian = 0; meridian < 4; meridian += 1) {
      const longitude = meridian * Math.PI / 4
      addGlobeLoop(angle => new THREE.Vector3(globeRadius * Math.cos(angle) * Math.cos(longitude),
        0.2 + globeRadius * Math.sin(angle), globeRadius * Math.cos(angle) * Math.sin(longitude)))
    }
    const fieldMaterial = new THREE.MeshBasicMaterial({ color: gold, transparent: true,
      opacity: 0.3, depthWrite: false })
    const fieldDepthUniform = { value: camera.position.length() }
    fieldMaterial.onBeforeCompile = shader => {
      shader.uniforms.fieldCenterDepth = fieldDepthUniform
      shader.vertexShader = 'varying float fieldViewDepth;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>',
        '#include <project_vertex>\nfieldViewDepth = -mvPosition.z;')
      shader.fragmentShader = 'varying float fieldViewDepth;\nuniform float fieldCenterDepth;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.a *= mix(0.3, 1.0, 1.0 - smoothstep(fieldCenterDepth - 3.8, fieldCenterDepth + 3.8, fieldViewDepth));')
    }
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffdf85, transparent: true,
      opacity: 0.15, depthWrite: false })
    fieldCurves.forEach(curve => {
      field.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 192, 0.015, 6, true), fieldMaterial))
    })
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffe6a0 })
    const fieldParticles = [0, 2].map((curveIndex, index) => {
      const particle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), particleMaterial)
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glowMaterial)
      particle.add(glow)
      particle.userData = { curve: fieldCurves[curveIndex], phase: index * 0.5 }
      particle.position.copy(particle.userData.curve.getPointAt(particle.userData.phase))
      field.add(particle)
      return particle
    })
    const updateFieldTheme = () => {
      const light = document.documentElement.dataset.theme === 'light'
      fieldMaterial.color.setHex(light ? 0x89600c : gold)
      fieldMaterial.opacity = light ? 0.48 : 0.32
      particleMaterial.color.setHex(light ? 0x89600c : 0xffe6a0)
      glowMaterial.color.setHex(light ? 0xb58a24 : 0xffdf85)
      glowMaterial.opacity = light ? 0.09 : 0.18
    }
    updateFieldTheme()
    const themeObserver = new MutationObserver(updateFieldTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 8),
      new THREE.ShadowMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }),
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -0.34
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    const hemisphere = new THREE.HemisphereLight(0xf7e6c5, 0x160407, 1.25)
    scene.add(hemisphere)

    const keyLight = new THREE.DirectionalLight(0xffe5a6, 5.2)
    keyLight.position.set(4.5, 7, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -5
    keyLight.shadow.camera.right = 5
    keyLight.shadow.camera.top = 5
    keyLight.shadow.camera.bottom = -5
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(0xb4223b, 18, 14, 2)
    rimLight.position.set(-4.2, 2.5, -3.5)
    scene.add(rimLight)

    const goldLight = new THREE.PointLight(gold, 12, 10, 2)
    goldLight.position.set(3.5, 1.5, 3.2)
    scene.add(goldLight)

    let pointerX = 0
    let pointerY = 0
    let modelYaw = -0.24
    let modelPitch = -0.04
    let dragPointerId = null
    let lastPointerX = 0
    let lastPointerY = 0
    let inView = true
    let animationFrame

    // Frame the actual board and circle rather than an oversized bounding sphere.
    const frameTarget = new THREE.Vector3(0, 0.2, 0)
    const viewDirection = new THREE.Vector3(6.7, 5.05, 7.3).normalize()
    const viewRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), viewDirection).normalize()
    const viewUp = new THREE.Vector3().crossVectors(viewDirection, viewRight).normalize()
    const framingPoints = []
    for (const x of [-3.1, 3.1]) for (const y of [-0.2, 0.85]) for (const z of [-2.05, 2.05]) {
      framingPoints.push(new THREE.Vector3(x, y, z))
    }
    const framePoint = new THREE.Vector3()
    let mobileFraming = false
    const fitMobileCamera = () => {
      if (!mobileFraming) return
      rig.updateMatrixWorld(true)
      field.updateMatrixWorld(true)
      const verticalSlope = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.88
      const horizontalSlope = verticalSlope * camera.aspect
      let distance = 0
      const fitPoint = (point, followsBoard) => {
        framePoint.copy(point)
        framePoint.applyMatrix4(followsBoard ? rig.matrixWorld : field.matrixWorld)
        framePoint.sub(frameTarget)
        const depth = framePoint.dot(viewDirection)
        distance = Math.max(distance,
          Math.abs(framePoint.dot(viewRight)) / horizontalSlope + depth,
          Math.abs(framePoint.dot(viewUp)) / verticalSlope + depth)
      }
      for (const point of framingPoints) fitPoint(point, true)
      for (const point of fieldPoints) fitPoint(point, false)
      camera.position.copy(viewDirection).multiplyScalar(distance).add(frameTarget)
      camera.lookAt(frameTarget)
    }
    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      mobileFraming = true
      if (mobileFraming) fitMobileCamera()
      else {
        camera.position.set(6.7, 5.25, 7.3)
        camera.lookAt(frameTarget)
      }
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }

    const handlePointerMove = (event) => {
      if (reducedMotion) return

      if (dragPointerId === event.pointerId) {
        modelYaw += (event.clientX - lastPointerX) * 0.009
        modelPitch = THREE.MathUtils.clamp(
          modelPitch + (event.clientY - lastPointerY) * 0.007,
          -1.3,
          1.12,
        )
        lastPointerX = event.clientX
        lastPointerY = event.clientY
        return
      }

      if (event.pointerType === 'touch') return
      const bounds = mount.getBoundingClientRect()
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.38
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.22
    }

    const handlePointerDown = (event) => {
      if (reducedMotion || (event.pointerType === 'mouse' && event.button !== 0)) return
      dragPointerId = event.pointerId
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      mount.dataset.dragging = 'true'
      mount.setPointerCapture?.(event.pointerId)
    }

    const handlePointerUp = (event) => {
      if (dragPointerId !== event.pointerId) return
      dragPointerId = null
      delete mount.dataset.dragging
      if (mount.hasPointerCapture?.(event.pointerId)) mount.releasePointerCapture(event.pointerId)
    }

    const handlePointerLeave = () => {
      pointerX = 0
      pointerY = 0
    }

    const renderFrame = (time) => {
      animationFrame = window.requestAnimationFrame(renderFrame)
      if (!inView || document.hidden) return

      const elapsed = time * 0.001
      if (!reducedMotion) {
        const idleDrift = Math.sin(elapsed * 0.2) * 0.035
        rig.rotation.y += (modelYaw + pointerX + idleDrift - rig.rotation.y) * 0.055
        rig.rotation.x += (modelPitch + pointerY - rig.rotation.x) * 0.055
        rig.position.y = Math.sin(elapsed * 0.72) * 0.08
        field.rotation.y = elapsed * 0.035
        fieldParticles.forEach(particle => {
          particle.position.copy(particle.userData.curve.getPointAt((elapsed * 0.035 + particle.userData.phase) % 1))
        })
        signals.forEach((signal) => {
          const progress = (elapsed * signal.userData.speed + signal.userData.phase) % 1
          signal.position.copy(signal.userData.curve.getPointAt(progress))
        })
        leds.forEach((led, index) => {
          led.scale.setScalar(0.86 + Math.sin(elapsed * 2.4 + index * 1.8) * 0.14)
        })
      }

      fitMobileCamera()
      fieldDepthUniform.value = camera.position.distanceTo(frameTarget)
      renderer.render(scene, camera)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    }, { threshold: 0.05 })
    intersectionObserver.observe(mount)
    mount.addEventListener('pointerdown', handlePointerDown)
    mount.addEventListener('pointermove', handlePointerMove, { passive: true })
    mount.addEventListener('pointerup', handlePointerUp)
    mount.addEventListener('pointercancel', handlePointerUp)
    mount.addEventListener('pointerleave', handlePointerLeave)

    resize()
    animationFrame = window.requestAnimationFrame(renderFrame)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      intersectionObserver.disconnect()
      mount.removeEventListener('pointerdown', handlePointerDown)
      mount.removeEventListener('pointermove', handlePointerMove)
      mount.removeEventListener('pointerup', handlePointerUp)
      mount.removeEventListener('pointercancel', handlePointerUp)
      mount.removeEventListener('pointerleave', handlePointerLeave)

      const geometries = new Set()
      const materials = new Set()
      const textures = new Set([chipTexture])
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry)
        if (object.material) {
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
          objectMaterials.forEach((material) => materials.add(material))
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="hero-visual" aria-hidden="true">
      <div ref={mountRef} className="hero-webgl" />
      <div className="hero-visual__status">
        <span className="hero-visual__status-dot" />
        <span>Drag to rotate · face labels toward you</span>
      </div>
      <div className="hero-visual__legend">
        <span>Embedded</span>
        <i />
        <span>IoT</span>
        <i />
        <span>Applied AI</span>
      </div>
    </div>
  )
}
