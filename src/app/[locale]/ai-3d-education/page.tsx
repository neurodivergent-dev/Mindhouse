'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import MobileNav from '@/components/mobile-nav';
import { getStoredAiPreferences } from "@/lib/ai-preferences";
import { AIFactory } from "@/services/ai/AIFactory";
import { type AiChatOutput } from '@/ai/flows/ai-chat';  // only for type of setAiResponse (we can simplify later)
import { Brain, Bot, Palette, Zap, BookOpen, Lightbulb, Target, Users, Eye, Play, CheckCircle } from 'lucide-react';
import { errorLogger } from '@/lib/error-logger';
import {
  get3DEducationGeminiPrompt,
  type ComplexityLevel,
} from '@/lib/ai-3d-education-prompts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Gemini AI 3D model type definitions
interface GeminiModelData {
  geometry?: GeminiGeometry;
  materials?: GeminiMaterial[];
  assets?: GeminiComponent[];
  components?: GeminiComponent[];
  lights?: GeminiLight[];
  camera?: {
    position?: number[];
    lookAt?: number[];
    fov?: number;
  };
}

interface GeminiComponent {
  geometry: GeminiGeometry;
  material: GeminiMaterial;
  position?: number[];
  rotation?: number[];
  scale?: number[];
  animation?: {
    type: 'rotation' | 'pulse' | 'orbit' | 'wave';
    speed?: number;
    amplitude?: number;
  };
}

interface GeminiGeometry {
  type: string;
  parameters?: Record<string, unknown>;
  radius?: number;
  segments?: number;
  dimensions?: number[];
}

interface GeminiMaterial {
  type: string;
  color?: string | number;
  opacity?: number;
  transparent?: boolean;
  metalness?: number;
  roughness?: number;
}

interface GeminiMaterialOptions {
  color?: string | number;
  opacity?: number;
  transparent?: boolean;
  metalness?: number;
  roughness?: number;
}

interface GeminiLight {
  type: string;
  color?: string | number;
  intensity?: number;
  position?: number[];
  distance?: number;
  angle?: number;
  penumbra?: number;
}

interface GeminiLightOptions {
  color?: string | number;
  intensity?: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
}

export default function AI3DEducationPage() {
  const t = useTranslations('Ai3dEducation');
  const locale = useLocale();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiChatOutput | null>(null);
  const [subject, setSubject] = useState('');
  const [complexity, setComplexity] = useState<ComplexityLevel>('medium');

  // 3D Viewer controls (makes the experience dynamic and useful)
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1.0);
  const animatedMeshesRef = useRef<THREE.Object3D[]>([]);

  // Refs so the animation loop can read latest control values without re-creating the loop
  const autoRotateRef = useRef(autoRotate);
  const animSpeedRef = useRef(animSpeed);

  // Keep animation refs in sync (avoids stale closures in RAF)
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);
  useEffect(() => { animSpeedRef.current = animSpeed; }, [animSpeed]);

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Three.js scene kurulumu - FIXED sizing + rich visuals + proper resize
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) {return;}

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1116);
    scene.fog = new THREE.Fog(0x0f1116, 8, 25);

    // Camera - will be sized to container
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 5.5);
    camera.lookAt(0, 0.5, 0);

    // Renderer sized to the container element (not full window!)
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initial size from container
    const updateSize = () => {
      if (!currentMount) {return;}
      const w = currentMount.clientWidth || 800;
      const h = currentMount.clientHeight || 600;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    updateSize();

    currentMount.appendChild(renderer.domElement);

    // === MUCH BETTER LIGHTING (not flat/static) ===
    const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x222233, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(8, 14, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    scene.add(dirLight);

    // Rim / fill lights for nicer 3D pop
    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.45);
    rimLight.position.set(-10, 4, -8);
    scene.add(rimLight);

    const backLight = new THREE.DirectionalLight(0xffeecc, 0.35);
    backLight.position.set(2, -6, -10);
    scene.add(backLight);

    // Soft point lights for highlights on educational models
    const pointLight1 = new THREE.PointLight(0x66ffcc, 0.6, 20);
    pointLight1.position.set(-3, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff88aa, 0.4, 18);
    pointLight2.position.set(4, -1, -2);
    scene.add(pointLight2);

    // Ground plane + grid for depth (makes it feel real, not floating in void)
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshLambertMaterial({ 
        color: 0x1a1f2e, 
        transparent: true, 
        opacity: 0.85 
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.8;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(18, 18, 0x334455, 0x223344);
    grid.position.y = -1.75;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // Controls - smooth and useful
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 1.2;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.92; // prevent going under ground too much
    controls.target.set(0, 0.3, 0);

    // Store refs
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // SINGLE animation loop - drives controls + model animations + auto-rotate
    const animate = () => {
      requestAnimationFrame(animate);

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const speed = animSpeedRef.current || 1;

      // Apply auto-rotate if enabled
      if (autoRotateRef.current && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 0.35 * speed;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      // Drive per-mesh animations (pulse, orbit, rotation, blink) with speed multiplier
      animatedMeshesRef.current.forEach((obj) => {
        if (!obj?.userData) {return;}
        const ud = obj.userData;

        if (ud.rotationSpeed) {
          obj.rotation.y += (ud.rotationSpeed || 0.01) * speed;
          if (ud.rotationSpeedX) {obj.rotation.x += (ud.rotationSpeedX * speed);}
        }

        // Orbiting (used by electrons etc)
        if (ud.orbitRadius && ud.speed !== undefined && ud.angle !== undefined) {
          ud.angle += (ud.speed || 0.02) * speed;
          const r = ud.orbitRadius;
          const yOff = ud.yOffset || 0;
          obj.position.x = Math.cos(ud.angle) * r;
          obj.position.z = Math.sin(ud.angle) * r;
          if (yOff) {obj.position.y = yOff + Math.sin(ud.angle * 1.3) * (ud.yAmp || 0.15);}
        }

        // Pulse / scale animation
        if (ud.pulse !== undefined) {
          ud.pulse += (ud.pulseSpeed || 0.05) * speed;
          const s = 1 + Math.sin(ud.pulse) * (ud.pulseAmp || 0.12);
          obj.scale.setScalar(s);
        }

        // Blink / emissive pulse (ribosomes, particles)
        if (ud.blink !== undefined) {
          ud.blink += (ud.blinkSpeed || 0.07) * speed;
          const mat = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat?.emissiveIntensity !== undefined) {
            mat.emissiveIntensity = 0.25 + Math.sin(ud.blink) * 0.65;
          }
        }

        // Float / wave
        if (ud.float !== undefined) {
          ud.float += (ud.floatSpeed || 0.02) * speed;
          obj.position.y += Math.sin(ud.float) * 0.012 * speed;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize handling (critical fix - makes it usable on all screen sizes)
    const handleResize = () => updateSize();
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for container size changes (better)
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(currentMount);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      if (currentMount && renderer.domElement) {
        try { currentMount.removeChild(renderer.domElement); } catch {}
      }
      renderer.dispose();
      controls.dispose();
      animatedMeshesRef.current = [];
    };
  }, []);

  // Doğrudan provider ile 3D model verisi üretimi (tutor wrapper olmadan anlık model oluşturmak için)
  const generate3DModel = async () => {
    if (!prompt.trim()) {return;}

    setIsGenerating(true);

    try {
      const resolvedSubject = subject.trim() || t('defaultSubject');
      const complexityLabel = t(`complexity.${complexity}`);
      const rawPrompt = get3DEducationGeminiPrompt(locale, {
        prompt: prompt.trim(),
        subject: resolvedSubject,
        complexity: complexityLabel,
      });

      const aiPreferences = getStoredAiPreferences();
      const provider = AIFactory.getProviderFromPreferences(aiPreferences);

      // Raw prompt'u doğrudan gönder (sadece JSON 3D veri bekliyoruz)
      await provider.generateText({
        prompt: `${rawPrompt  }\n\nIMPORTANT: Output ONLY the raw JSON object for the 3D scene. No extra text, no explanations, start with { and end with }.`,
      });

      // Basit bir response objesi oluştur (UI için) - LLM'in "ben oluşturdum" demesini engelle
      const fakeResponse: AiChatOutput = {
        response: `3D model/grafik anlık olarak oluşturuldu: "${prompt}". Fare ile döndürebilir, zoom yapabilirsiniz.`,
        confidence: 0.85,
        suggestedTopics: [],
        followUpQuestions: [],
        learningTips: [],
      };
      setAiResponse(fakeResponse);

      // 3D model oluştur - mevcut parse logic'i raw metinle çalışacak
      if (sceneRef.current) {
        create3DModelFromGemini(prompt, fakeResponse);
      }

    } catch (error) {
      errorLogger.logError('AI generation error', error);
      createSample3DModel(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

   // Tüm modelleri temizleme fonksiyonu (improved cleanup)
   const clearAllModels = () => {
     if (!sceneRef.current) {return;}

     const childrenToRemove: THREE.Object3D[] = [];

     sceneRef.current.children.forEach((child) => {
       // Preserve lights + ground + grid
       const isLight = child.type.includes('Light');
       const isGround = child.userData?.isGround || (child.type === 'Mesh' && (child as THREE.Mesh).geometry?.type === 'PlaneGeometry');
       const isGrid = child.type === 'GridHelper';
       if (!isLight && !isGround && !isGrid) {
         childrenToRemove.push(child);
       }
     });

     childrenToRemove.forEach((child) => {
       // Stop legacy animation loops
       if (child.userData?.animationLoop) {
         cancelAnimationFrame(child.userData.animationLoop);
       }
       if (child.type === 'Group') {
         child.children.forEach((groupChild) => {
           if (groupChild.userData?.animationLoop) {
             cancelAnimationFrame(groupChild.userData.animationLoop);
           }
         });
       }

       // Dispose resources
       if (child.type === 'Mesh') {
         const mesh = child as THREE.Mesh;
         if (mesh.geometry) {mesh.geometry.dispose();}
         if (mesh.material) {
           if (Array.isArray(mesh.material)) {
             mesh.material.forEach(mat => mat.dispose());
           } else {
             (mesh.material).dispose();
           }
         }
       }

       sceneRef.current!.remove(child);
     });

     // Clear tracked animated objects
     animatedMeshesRef.current = [];
    };

  // Gemini response'dan 3D model oluşturma
  const create3DModelFromGemini = (modelPrompt: string, aiData: AiChatOutput) => {
     if (!sceneRef.current) {return;}

     // Tüm önceki modelleri temizle (sadece ışıkları koru)
     clearAllModels();

    try {
      // Gemini response'u parse et
      const geminiResponse = aiData.response;
      let modelData;

             // JSON formatında response var mı kontrol et

       if (geminiResponse.includes('{') && geminiResponse.includes('}')) {
         // Markdown code blocks'ları temizle
         let cleanResponse = geminiResponse;

         // ```json ve ``` bloklarını kaldır
         if (cleanResponse.includes('```json')) {
           cleanResponse = cleanResponse.replace(/```json\s*/g, '');
         }
         if (cleanResponse.includes('```')) {
           cleanResponse = cleanResponse.replace(/```/g, '');
         }

         // JSON başlangıç ve bitiş noktalarını bul
         const jsonStart = cleanResponse.indexOf('{');
         const jsonEnd = cleanResponse.lastIndexOf('}') + 1;

         if (jsonStart !== -1 && jsonEnd > jsonStart) {
           const jsonString = cleanResponse.substring(jsonStart, jsonEnd);

           try {
             modelData = JSON.parse(jsonString);
            } catch (parseError) {
               errorLogger.logError('JSON parsing error', parseError);
               modelData = null;
           }
         } else {
            modelData = null;
         }
       } else {
          modelData = null;
       }

             // Gemini'den gelen veri ile model oluştur (assets veya components varsa)
       if (modelData && (modelData.assets || modelData.components || modelData.geometry)) {
              createGeminiModel(modelData);
       } else {
         // Fallback: Prompt'a göre basit model
          const promptLower = modelPrompt.toLowerCase();
        if (promptLower.includes('dna') || promptLower.includes('genetik')) {
          createDNAModel();
        } else if (promptLower.includes('atom') || promptLower.includes('molekül') || promptLower.includes('kimyasal')) {
          createAtomModel();
        } else if (promptLower.includes('hücre') || promptLower.includes('cell') || promptLower.includes('organel')) {
          createCellModel();
        } else if (promptLower.includes('kalp') || promptLower.includes('heart') || promptLower.includes('kardiyak')) {
          createHeartModel();
        } else if (promptLower.includes('beyin') || promptLower.includes('brain') || promptLower.includes('sinir')) {
          createBrainModel();
        } else if (promptLower.includes('iskelet') || promptLower.includes('kemik') || promptLower.includes('skeleton')) {
          createSkeletonModel();
        } else if (promptLower.includes('kas') || promptLower.includes('muscle') || promptLower.includes('kas sistemi')) {
          createMuscleModel();
        } else if (promptLower.includes('mitokondri') || promptLower.includes('mitochondria') || promptLower.includes('enerji')) {
          createMitochondriaModel();
        } else if (
          promptLower.includes('graph') || promptLower.includes('grafik') ||
          promptLower.includes('plot') || promptLower.includes('chart') ||
          promptLower.includes('fonksiyon') || promptLower.includes('function') ||
          promptLower.includes('eğri') || promptLower.includes('curve') ||
          promptLower.includes('sin') || promptLower.includes('cos') || promptLower.includes('veriler')
        ) {
          createGraphModel(modelPrompt);
        } else {
          // Varsayılan olarak prompt'a göre özel model
          createCustomModel(modelPrompt, aiData);
        }
      }
    } catch (error) {
      errorLogger.logError('3D model creation error', error);
      createSample3DModel(modelPrompt);
    }
  };

  // Gemini'den gelen veri ile 3D model oluşturma
  const createGeminiModel = (modelData: GeminiModelData) => {
    if (!sceneRef.current) {return;}

    const geminiGroup = new THREE.Group();

    // Ana model geometrisi
    if (modelData.geometry) {
      const geometry = createGeometryFromGemini(modelData.geometry);
      const material = createMaterialFromGemini(modelData.materials?.[0] || { type: 'standard' });

      if (geometry && material) {
        const mainMesh = new THREE.Mesh(geometry, material);
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        geminiGroup.add(mainMesh);
      }
    }

    // Bileşenler (assets veya components)
    const components = modelData.assets || modelData.components;
    if (components && Array.isArray(components)) {
      components.forEach((component: GeminiComponent) => {
        const compGeometry = createGeometryFromGemini(component.geometry);
        const compMaterial = createMaterialFromGemini(component.material);

        if (compGeometry && compMaterial) {
          const compMesh = new THREE.Mesh(compGeometry, compMaterial);

          // Pozisyon, rotasyon, ölçek
                     if (component.position && Array.isArray(component.position) && component.position.length >= 3) {
             compMesh.position.set(
               component.position[0] ?? 0,
               component.position[1] ?? 0,
               component.position[2] ?? 0,
             );
           }
                     if (component.rotation && Array.isArray(component.rotation) && component.rotation.length >= 3) {
             compMesh.rotation.set(
               component.rotation[0] ?? 0,
               component.rotation[1] ?? 0,
               component.rotation[2] ?? 0,
             );
           }
                     if (component.scale && Array.isArray(component.scale) && component.scale.length >= 3) {
             compMesh.scale.set(
               component.scale[0] ?? 1,
               component.scale[1] ?? 1,
               component.scale[2] ?? 1,
             );
           }

          // Animasyon verisi
          if (component.animation) {
            compMesh.userData.animation = component.animation;
          }

          compMesh.castShadow = true;
          geminiGroup.add(compMesh);
        }
      });
    }

    // Işıklar
    if (modelData.lights && Array.isArray(modelData.lights)) {
      modelData.lights.forEach((lightData: GeminiLight) => {
        const light = createLightFromGemini(lightData);
        if (light) {
          geminiGroup.add(light);
        }
      });
    }

    // Kamera ayarları
    if (modelData.camera && cameraRef.current) {
             if (modelData.camera.position && Array.isArray(modelData.camera.position) && modelData.camera.position.length >= 3) {
         cameraRef.current.position.set(
           modelData.camera.position[0] as number,
           modelData.camera.position[1] as number,
           modelData.camera.position[2] as number,
         );
       }
             if (modelData.camera.lookAt && Array.isArray(modelData.camera.lookAt) && modelData.camera.lookAt.length >= 3) {
         cameraRef.current.lookAt(
           modelData.camera.lookAt[0] as number,
           modelData.camera.lookAt[1] as number,
           modelData.camera.lookAt[2] as number,
         );
       }
      if (modelData.camera.fov) {
        cameraRef.current.fov = modelData.camera.fov;
        cameraRef.current.updateProjectionMatrix();
      }
    }

    // Eğer hiçbir mesh eklenmemişse, varsayılan bir küp ekle
    if (geminiGroup.children.length === 0) {
      const defaultGeometry = new THREE.BoxGeometry(1, 1, 1);
      const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
      const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
      defaultMesh.castShadow = true;
      defaultMesh.receiveShadow = true;
      geminiGroup.add(defaultMesh);
    }

    // Scene'e ekle
    sceneRef.current.add(geminiGroup);

    // Register Gemini generated objects into unified animation (supports the declared animation types)
    geminiGroup.children.forEach((child) => {
      if (child.userData?.animation) {
        const anim = child.userData.animation;
        if (anim.type === 'rotation') {child.userData.rotationSpeed = anim.speed || 0.015;}
        if (anim.type === 'pulse') {
          child.userData.pulse = 0;
          child.userData.pulseSpeed = (anim.speed || 1) * 0.06;
          child.userData.pulseAmp = anim.amplitude || 0.12;
        }
        if (anim.type === 'orbit') {
          child.userData.orbitRadius = anim.amplitude || 1.8;
          child.userData.speed = (anim.speed || 1) * 0.015;
          child.userData.angle = Math.random() * Math.PI * 2;
        }
        if (anim.type === 'wave') {
          child.userData.float = 0;
          child.userData.floatSpeed = 0.03;
        }
      }
      if (child.type === 'Mesh') {animatedMeshesRef.current.push(child);}
    });
    animatedMeshesRef.current.push(geminiGroup);
  };

  // Gemini geometry verisinden Three.js geometry oluşturma
  const createGeometryFromGemini = (geoData: GeminiGeometry | null | undefined): THREE.BufferGeometry | null => {
    if (!geoData?.type) {return null;}

    switch (geoData.type.toLowerCase()) {
      case 'sphere':
        return new THREE.SphereGeometry(
          geoData.radius || 1,
          geoData.segments || 32,
          geoData.segments || 16,
        );
      case 'box':
        return new THREE.BoxGeometry(
          geoData.dimensions?.[0] || 1,
          geoData.dimensions?.[1] || 1,
          geoData.dimensions?.[2] || 1,
        );
      case 'cylinder':
        return new THREE.CylinderGeometry(
          geoData.radius || 1,
          geoData.radius || 1,
          geoData.dimensions?.[1] || 2,
          geoData.segments || 32,
        );
      case 'torus':
        return new THREE.TorusGeometry(
          geoData.radius || 1,
          geoData.dimensions?.[0] || 0.3,
          geoData.segments || 16,
          geoData.segments || 100,
        );
      case 'capsule':
        return new THREE.CapsuleGeometry(
          geoData.radius || 0.5,
          geoData.dimensions?.[1] || 1,
          geoData.segments || 4,
          geoData.segments || 8,
        );
      default:
        return new THREE.SphereGeometry(1);
    }
  };

  // Gemini material verisinden Three.js material oluşturma
  const createMaterialFromGemini = (matData: GeminiMaterial | null | undefined): THREE.Material => {
    if (!matData) {return new THREE.MeshPhongMaterial({ color: 0x888888 });}

    // Hex string'i hex number'a çevir
    let color = 0x888888;
    if (matData.color) {
      if (typeof matData.color === 'string' && matData.color.startsWith('#')) {
        color = parseInt(matData.color.replace('#', ''), 16);
      } else if (typeof matData.color === 'number') {
        color = matData.color;
      }
    }

    const materialOptions: GeminiMaterialOptions = {
      color,
      transparent: matData.transparent || false,
      opacity: matData.opacity || 1.0,
      roughness: matData.roughness || 0.5,
      metalness: matData.metalness || 0.0,
    };

    switch (matData.type?.toLowerCase()) {
      case 'basic':
        return new THREE.MeshBasicMaterial(materialOptions);
      case 'emissive':
        return new THREE.MeshPhongMaterial({
          ...materialOptions,
          emissive: materialOptions.color || 0x888888,
          emissiveIntensity: 0.5,
        });
      case 'standard':
      case 'phong':
      default:
        return new THREE.MeshPhongMaterial(materialOptions);
    }
  };

  // Gemini light verisinden Three.js light oluşturma
  const createLightFromGemini = (lightData: GeminiLight | null | undefined): THREE.Light | null => {
    if (!lightData?.type) {return null;}

    // Hex string'i hex number'a çevir
    let color = 0xffffff;
    if (lightData.color) {
      if (typeof lightData.color === 'string' && lightData.color.startsWith('#')) {
        color = parseInt(lightData.color.replace('#', ''), 16);
      } else if (typeof lightData.color === 'number') {
        color = lightData.color;
      }
    }

    const lightOptions: GeminiLightOptions = {
      color,
      intensity: lightData.intensity || 1.0,
    };

    switch (lightData.type.toLowerCase()) {
      case 'ambient':
        return new THREE.AmbientLight(lightOptions.color, lightOptions.intensity);
      case 'directional':
        const dirLight = new THREE.DirectionalLight(lightOptions.color, lightOptions.intensity);
                 if (lightData.position && Array.isArray(lightData.position) && lightData.position.length >= 3) {
           dirLight.position.set(
             lightData.position[0] ?? 0,
             lightData.position[1] ?? 0,
             lightData.position[2] ?? 0,
           );
         }
        return dirLight;
      case 'point':
        const pointLight = new THREE.PointLight(lightOptions.color, lightOptions.intensity);
                 if (lightData.position && Array.isArray(lightData.position) && lightData.position.length >= 3) {
           pointLight.position.set(
             lightData.position[0] ?? 0,
             lightData.position[1] ?? 0,
             lightData.position[2] ?? 0,
           );
         }
        return pointLight;
      default:
        return new THREE.AmbientLight(0x404040, 0.6);
    }
  };

  // DNA modeli oluşturma - clean + nice double helix
  const createDNAModel = () => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    const dnaGroup = new THREE.Group();

    // Much nicer double helix (deterministic + visually clean)
    const turns = 4.8;
    const steps = 26;
    const radius = 0.95;

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const y = (i / steps) * 5.0 - 2.5;

      // Strand 1
      const b1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 10),
        new THREE.MeshPhongMaterial({ color: 0x33ffaa, shininess: 22 })
      );
      b1.position.set(Math.cos(t) * radius, y, Math.sin(t) * radius);
      b1.castShadow = true;
      dnaGroup.add(b1);

      // Strand 2
      const b2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 10),
        new THREE.MeshPhongMaterial({ color: 0xff5599, shininess: 22 })
      );
      b2.position.set(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius);
      b2.castShadow = true;
      dnaGroup.add(b2);

      // Base-pair rungs (cleaner)
      if (i % 2 === 0) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, radius * 1.85, 4),
          new THREE.MeshPhongMaterial({ color: 0xffee55, shininess: 30 })
        );
        rung.position.set(0, y, 0);
        const dir = new THREE.Vector3().subVectors(b1.position, b2.position).normalize();
        rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        dnaGroup.add(rung);
      }
    }

    // Central backbone
    const axis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 5.1),
      new THREE.MeshPhongMaterial({ color: 0x445566, transparent: true, opacity: 0.6 })
    );
    dnaGroup.add(axis);

    dnaGroup.userData = { rotationSpeed: 0.007 };
    sceneRef.current.add(dnaGroup);

    // Apply current wireframe preference
    if (wireframeMode) {
      dnaGroup.traverse((o) => { if ((o as THREE.Mesh).material) {((o as THREE.Mesh).material as THREE.MeshStandardMaterial).wireframe = true;} });
    }

    // Register everything that should animate
    dnaGroup.children.forEach((child) => {
      if (child.type === 'Mesh') {
        const m = child as THREE.Mesh;
        if (m.geometry.type?.includes('Sphere')) {
          m.userData.pulse = Math.random() * 2;
          m.userData.pulseSpeed = 0.07;
          m.userData.pulseAmp = 0.085;
        }
        animatedMeshesRef.current.push(m);
      }
    });
    animatedMeshesRef.current.push(dnaGroup);
  };

  // Atom modeli oluşturma - proper orbiting electrons (visually rich)
  const createAtomModel = () => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    const atomGroup = new THREE.Group();

    // Nucleus (glowing)
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 28, 20),
      new THREE.MeshPhongMaterial({ color: 0x3366ff, emissive: 0x112244, shininess: 12 })
    );
    nucleus.castShadow = true;
    nucleus.receiveShadow = true;
    nucleus.userData = { pulse: 1.2, pulseSpeed: 0.045, pulseAmp: 0.07 };
    atomGroup.add(nucleus);

    // Inner nucleus particles
    for (let i = 0; i < 14; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.09),
        new THREE.MeshPhongMaterial({ color: i % 2 ? 0xff3366 : 0x66ff99, emissive: 0x331122 })
      );
      p.position.set(
        (Math.random() - 0.5) * 0.55,
        (Math.random() - 0.5) * 0.55,
        (Math.random() - 0.5) * 0.55,
      );
      p.userData = { pulse: Math.random() * 3, pulseSpeed: 0.09, pulseAmp: 0.25 };
      atomGroup.add(p);
    }

    // Three perpendicular nice orbits + electrons
    const orbitColors = [0x44ffff, 0xffdd44, 0xff66cc];
    for (let i = 0; i < 3; i++) {
      const r = 1.65 + i * 0.72;
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.018, 6, 48),
        new THREE.MeshBasicMaterial({ color: orbitColors[i] ?? 0x44ffff, transparent: true, opacity: 0.45 })
      );
      // Rotate to get 3D orbitals
      if (i === 0) {orbit.rotation.x = Math.PI * 0.5;}
      if (i === 1) {orbit.rotation.y = Math.PI * 0.5;}
      if (i === 2) {orbit.rotation.z = Math.PI * 0.35;}
      atomGroup.add(orbit);

      // 2 electrons per shell, different phase
      for (let e = 0; e < 2; e++) {
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(0.11),
          new THREE.MeshPhongMaterial({ color: 0x88ffff, emissive: 0x44aaff, emissiveIntensity: 0.7, shininess: 40 })
        );
        electron.userData = {
          orbitRadius: r,
          speed: 0.018 + i * 0.006 + e * 0.004,
          angle: (e * Math.PI) + (i * 1.1),
          yOffset: (i - 1) * 0.2,
          yAmp: 0.12,
        };
        atomGroup.add(electron);
        animatedMeshesRef.current.push(electron);
      }
    }

    atomGroup.userData = { rotationSpeed: 0.004 };
    sceneRef.current.add(atomGroup);

    animatedMeshesRef.current.push(nucleus);
    atomGroup.children.forEach(c => {
      if (c.userData?.pulse) {animatedMeshesRef.current.push(c);}
    });
    animatedMeshesRef.current.push(atomGroup);
  };

  // Hücre modeli oluşturma (cleaned + registered animations)
  const createCellModel = () => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    const cellGroup = new THREE.Group();

    // Ana hücre zarı
    const cellGeometry = new THREE.SphereGeometry(1.2);
    const cellMaterial = new THREE.MeshPhongMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
    cellMesh.castShadow = true;
    cellMesh.receiveShadow = true;
    cellGroup.add(cellMesh);

    // Hücre içi sıvı (cytoplasm)
    const cytoplasmGeometry = new THREE.SphereGeometry(1.1);
    const cytoplasmMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.2,
    });

    const cytoplasmMesh = new THREE.Mesh(cytoplasmGeometry, cytoplasmMaterial);
    cytoplasmMesh.castShadow = true;
    cellGroup.add(cytoplasmMesh);

    // Çekirdek (nucleus)
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.4),
      new THREE.MeshPhongMaterial({
        color: 0xff0088,
        transparent: true,
        opacity: 0.8,
      }),
    );
    nucleus.position.set(0.3, 0.2, 0.1);
    nucleus.castShadow = true;
    nucleus.userData = { pulse: 0 };
    cellGroup.add(nucleus);

    // Çekirdek zarı
    const nucleusMembrane = new THREE.Mesh(
      new THREE.SphereGeometry(0.42),
      new THREE.MeshPhongMaterial({
        color: 0xff4488,
        transparent: true,
        opacity: 0.4,
        wireframe: true,
      }),
    );
    nucleusMembrane.position.copy(nucleus.position);
    cellGroup.add(nucleusMembrane);

    // Mitokondri
    for (let i = 0; i < 8; i++) {
      const mitochondria = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.08, 0.2, 4, 8),
        new THREE.MeshPhongMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.8,
        }),
      );
      mitochondria.position.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
      );
      mitochondria.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      mitochondria.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulse: Math.random() * Math.PI * 2,
      };
      cellGroup.add(mitochondria);
    }

    // Endoplazmik retikulum
    for (let i = 0; i < 15; i++) {
      const er = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshPhongMaterial({
          color: 0x8888ff,
          transparent: true,
          opacity: 0.7,
        }),
      );
      er.position.set(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
      );
      er.userData = {
        pulse: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4,
      };
      cellGroup.add(er);
    }

    // Golgi aparatı
    const golgi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
      new THREE.MeshPhongMaterial({
        color: 0xff88ff,
        transparent: true,
        opacity: 0.8,
      }),
    );
    golgi.position.set(-0.4, -0.3, 0.2);
    golgi.rotation.x = Math.PI / 2;
    golgi.userData = { pulse: 0 };
    cellGroup.add(golgi);

    // Ribozomlar
    for (let i = 0; i < 25; i++) {
      const ribosome = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.3,
        }),
      );
      ribosome.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
      ribosome.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      cellGroup.add(ribosome);
    }

    // Animasyon için referans sakla
    cellGroup.userData = {
      rotationSpeed: 0.003,
      cellPulse: 0,
    };

    sceneRef.current.add(cellGroup);

    // Register for the unified animation loop (much cleaner + respects speed slider)
    cellGroup.userData = { rotationSpeed: 0.0025 };
    animatedMeshesRef.current.push(cellGroup);

    // Mark children for pulse/blink so central loop handles them
    cellGroup.children.forEach((child, index) => {
      if (child === nucleus || child === cellMesh) {
        child.userData.pulse = index * 0.6;
        child.userData.pulseSpeed = 0.045;
        child.userData.pulseAmp = 0.08;
        animatedMeshesRef.current.push(child);
      } else if (child.userData?.blink !== undefined) {
        animatedMeshesRef.current.push(child);
      } else if (child.userData?.pulse || child.userData?.rotationSpeed) {
        animatedMeshesRef.current.push(child);
      }
    });
  };

  // Kalp modeli oluşturma
  const createHeartModel = () => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    const heartGroup = new THREE.Group();

    // Ana kalp şekli (basitleştirilmiş)
    const heartGeometry = new THREE.SphereGeometry(1, 32, 16);
    const heartMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.castShadow = true;
    heartMesh.receiveShadow = true;
    heartGroup.add(heartMesh);

    // Kalp odacıkları
    const leftVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.6),
      new THREE.MeshPhongMaterial({
        color: 0xcc0000,
        transparent: true,
        opacity: 0.9,
      }),
    );
    leftVentricle.position.set(-0.3, -0.2, 0);
    leftVentricle.castShadow = true;
    heartGroup.add(leftVentricle);

    const rightVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshPhongMaterial({
        color: 0xaa0000,
        transparent: true,
        opacity: 0.9,
      }),
    );
    rightVentricle.position.set(0.3, -0.1, 0);
    rightVentricle.castShadow = true;
    heartGroup.add(rightVentricle);

    // Atardamarlar
    const aorta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 1.2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.8,
      }),
    );
    aorta.position.set(0, 0.8, 0);
    aorta.rotation.x = Math.PI / 2;
    aorta.castShadow = true;
    heartGroup.add(aorta);

    // Kalp atışı animasyonu için referans sakla
    heartGroup.userData = {
      pulse: 0,
      rotationSpeed: 0.002,
    };

    sceneRef.current.add(heartGroup);

    // Register pulse + rotation for central loop
    heartGroup.userData = { rotationSpeed: 0.0018 };
    heartMesh.userData = { pulse: 2.2, pulseSpeed: 0.09, pulseAmp: 0.13 };
    leftVentricle.userData = { pulse: 1.8, pulseSpeed: 0.085, pulseAmp: 0.11 };
    rightVentricle.userData = { pulse: 2.5, pulseSpeed: 0.08, pulseAmp: 0.09 };

    [heartMesh, leftVentricle, rightVentricle, heartGroup].forEach(o => animatedMeshesRef.current.push(o));
  };

  // Beyin modeli oluşturma
  const createBrainModel = () => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    const brainGroup = new THREE.Group();

    // Ana beyin şekli
    const brainGeometry = new THREE.SphereGeometry(1.2, 32, 16);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa88,
      transparent: true,
      opacity: 0.8,
    });

    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainMesh.castShadow = true;
    brainMesh.receiveShadow = true;
    brainGroup.add(brainMesh);

    // Beyin yarıküreleri
    const leftHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.8),
      new THREE.MeshPhongMaterial({
        color: 0xff9988,
        transparent: true,
        opacity: 0.9,
      }),
    );
    leftHemisphere.position.set(-0.4, 0, 0);
    leftHemisphere.castShadow = true;
    brainGroup.add(leftHemisphere);

    const rightHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.8),
      new THREE.MeshPhongMaterial({
        color: 0xff9988,
        transparent: true,
        opacity: 0.9,
      }),
    );
    rightHemisphere.position.set(0.4, 0, 0);
    rightHemisphere.castShadow = true;
    brainGroup.add(rightHemisphere);

    // Beyin sapı
    const brainStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.8, 8),
      new THREE.MeshPhongMaterial({
        color: 0xcc9988,
        transparent: true,
        opacity: 0.8,
      }),
    );
    brainStem.position.set(0, -1, 0);
    brainStem.castShadow = true;
    brainGroup.add(brainStem);

    // Nöronlar (parçacık sistemi)
    for (let i = 0; i < 30; i++) {
      const neuron = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshPhongMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 0.5,
        }),
      );
      neuron.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
      neuron.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      brainGroup.add(neuron);
    }

    // Animasyon için referans sakla
    brainGroup.userData = {
      pulse: 0,
      rotationSpeed: 0.003,
    };

    sceneRef.current.add(brainGroup);

    // Animasyon loop'u ekle
    const animateBrain = () => {
      if (brainGroup.userData) {
        // Beyin nabız efekti
        brainGroup.userData.pulse += 0.04;
        const pulse = 1 + Math.sin(brainGroup.userData.pulse) * 0.08;
        brainMesh.scale.setScalar(pulse);

        // Nöron yanıp sönme efekti
        brainGroup.children.forEach((child) => {
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        brainGroup.rotation.y += brainGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateBrain);
      brainGroup.userData.animationLoop = animationId;
    };
    animateBrain();
  };

  // İskelet modeli oluşturma
  const createSkeletonModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const skeletonGroup = new THREE.Group();

    // Kafatası
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.6),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.9,
      }),
    );
    skull.castShadow = true;
    skeletonGroup.add(skull);

    // Omurga
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    spine.position.set(0, -1.5, 0);
    spine.castShadow = true;
    skeletonGroup.add(spine);

    // Kaburgalar
    for (let i = 0; i < 6; i++) {
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.05, 8, 16),
        new THREE.MeshPhongMaterial({
          color: 0xf5f5dc,
          transparent: true,
          opacity: 0.7,
        }),
      );
      rib.position.set(0, -0.8 + i * 0.2, 0);
      rib.rotation.x = Math.PI / 2;
      rib.castShadow = true;
      skeletonGroup.add(rib);
    }

    // Kollar
    const leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    leftArm.position.set(-1, -0.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    skeletonGroup.add(leftArm);

    const rightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    rightArm.position.set(1, -0.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    skeletonGroup.add(rightArm);

    // Bacaklar
    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    leftLeg.position.set(-0.3, -2.8, 0);
    leftLeg.castShadow = true;
    skeletonGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    rightLeg.position.set(0.3, -2.8, 0);
    rightLeg.castShadow = true;
    skeletonGroup.add(rightLeg);

    // Animasyon için referans sakla
    skeletonGroup.userData = {
      rotationSpeed: 0.002,
    };

    sceneRef.current.add(skeletonGroup);

    // Animasyon loop'u ekle
    const animateSkeleton = () => {
      if (skeletonGroup.userData) {
        // Genel dönüş
        skeletonGroup.rotation.y += skeletonGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateSkeleton);
      skeletonGroup.userData.animationLoop = animationId;
    };
    animateSkeleton();
  };

  // Kas modeli oluşturma
  const createMuscleModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const muscleGroup = new THREE.Group();

    // Ana kas grubu
    const mainMuscle = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.8, 1.5, 8, 16),
      new THREE.MeshPhongMaterial({
        color: 0xff6666,
        transparent: true,
        opacity: 0.8,
      }),
    );
    mainMuscle.castShadow = true;
    muscleGroup.add(mainMuscle);

    // Kas lifleri
    for (let i = 0; i < 20; i++) {
      const muscleFiber = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.05, 1.2, 4, 8),
        new THREE.MeshPhongMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.9,
        }),
      );
      muscleFiber.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.8,
      );
      muscleFiber.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      muscleFiber.userData = {
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05,
      };
      muscleFiber.castShadow = true;
      muscleGroup.add(muscleFiber);
    }

    // Kas kasılma animasyonu için referans sakla
    muscleGroup.userData = {
      contraction: 0,
      rotationSpeed: 0.003,
    };

    sceneRef.current.add(muscleGroup);

    // Animasyon loop'u ekle
    const animateMuscle = () => {
      if (muscleGroup.userData) {
        // Kas kasılma efekti
        muscleGroup.userData.contraction += 0.05;
        const contraction = 1 + Math.sin(muscleGroup.userData.contraction) * 0.2;
        mainMuscle.scale.setScalar(contraction);

        // Kas lifleri nabız efekti
        muscleGroup.children.forEach((child) => {
          if (child.userData.pulse) {
            child.userData.pulse += child.userData.pulseSpeed;
            const pulse = 1 + Math.sin(child.userData.pulse) * 0.3;
            child.scale.setScalar(pulse);
          }
        });

        // Genel dönüş
        muscleGroup.rotation.y += muscleGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateMuscle);
      muscleGroup.userData.animationLoop = animationId;
    };
    animateMuscle();
  };

  // Mitokondri modeli oluşturma
  const createMitochondriaModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const mitochondriaGroup = new THREE.Group();

    // Ana mitokondri zarı (dış zar)
    const outerMembrane = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.8, 1.5, 8, 16),
      new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      }),
    );
    outerMembrane.castShadow = true;
    mitochondriaGroup.add(outerMembrane);

    // İç zar (cristae) - mitokondri karakteristik özelliği
    for (let i = 0; i < 12; i++) {
      const crista = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.6, 1.2, 6, 12),
        new THREE.MeshPhongMaterial({
          color: 0x00cc66,
          transparent: true,
          opacity: 0.8,
        }),
      );
      crista.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.8,
      );
      crista.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      crista.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulse: Math.random() * Math.PI * 2,
      };
      crista.castShadow = true;
      mitochondriaGroup.add(crista);
    }

    // Mitokondri matrisi (iç sıvı)
    const matrix = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.7, 1.3, 6, 12),
      new THREE.MeshPhongMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.2,
      }),
    );
    matrix.castShadow = true;
    mitochondriaGroup.add(matrix);

    // Enerji parçacıkları (ATP)
    for (let i = 0; i < 25; i++) {
      const atp = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5,
        }),
      );
      atp.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
      );
      atp.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      atp.castShadow = true;
      mitochondriaGroup.add(atp);
    }

    // Animasyon için referans sakla
    mitochondriaGroup.userData = {
      rotationSpeed: 0.003,
      pulse: 0,
    };

    sceneRef.current.add(mitochondriaGroup);

    // Animasyon loop'u ekle
    const animateMitochondria = () => {
      if (mitochondriaGroup.userData) {
        // Ana mitokondri nabız efekti
        mitochondriaGroup.userData.pulse += 0.04;
        const pulse = 1 + Math.sin(mitochondriaGroup.userData.pulse) * 0.1;
        outerMembrane.scale.setScalar(pulse);

        // Cristae animasyonları
        mitochondriaGroup.children.forEach((child) => {
          if (child.userData.rotationSpeed) {
            child.rotation.y += child.userData.rotationSpeed;
            child.userData.pulse += 0.05;
            const cristaPulse = 1 + Math.sin(child.userData.pulse) * 0.2;
            child.scale.setScalar(cristaPulse);
          }

          // ATP yanıp sönme efekti
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        mitochondriaGroup.rotation.y += mitochondriaGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateMitochondria);
      mitochondriaGroup.userData.animationLoop = animationId;
    };
    animateMitochondria();
  };

  // Özel model oluşturma
  const createCustomModel = (_modelPrompt: string, aiData: AiChatOutput) => {
    if (!sceneRef.current) {return;}

    // Mevcut modelleri temizle
    const existingModels = sceneRef.current.children.filter(child =>
      child.type === 'Mesh' && child !== sceneRef.current!.children[0], // Işıkları koru
    );
    existingModels.forEach(model => sceneRef.current!.remove(model));

    const customGroup = new THREE.Group();

    // AI response'a göre ana model
    const mainGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mainMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.8,
    });

    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    mainMesh.userData = { rotationSpeed: 0.01 };
    customGroup.add(mainMesh);

    // AI response'dan önerilen konulara göre ek modeller
    if (aiData.suggestedTopics.length > 0) {
      aiData.suggestedTopics.forEach((_topic, index) => {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.2),
          new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8,
          }),
        );
        sphere.position.set(
          Math.cos(index * 0.8) * 3,
          Math.sin(index * 0.8) * 3,
          0,
        );
        sphere.userData = {
          orbitRadius: 3,
          angle: index * 0.8,
          speed: 0.02 + index * 0.01,
        };
        sphere.castShadow = true;
        customGroup.add(sphere);
      });
    }

    // AI response'dan öğrenme ipuçlarına göre ek bileşenler
    if (aiData.learningTips.length > 0) {
      aiData.learningTips.forEach((_tip, index) => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.15, 0.15),
          new THREE.MeshPhongMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.9,
          }),
        );
        cube.position.set(
          Math.cos(index * 1.2) * 2,
          Math.sin(index * 1.2) * 2,
          Number(Math.cos(index * 0.5)) * 1,
        );
        cube.userData = {
          pulse: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
        };
        cube.castShadow = true;
        customGroup.add(cube);
      });
    }

    // Güven seviyesine göre parçacık efekti
    const particleCount = Math.floor(aiData.confidence * 50);
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.02),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5,
        }),
      );
      particle.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      );
      particle.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      customGroup.add(particle);
    }

    // Animasyon için referans sakla
    customGroup.userData = {
      rotationSpeed: 0.005,
    };

    sceneRef.current.add(customGroup);

    // Animasyon loop'u ekle
    const animateCustom = () => {
      if (customGroup.userData) {
        // Ana model dönüşü
        mainMesh.rotation.y += mainMesh.userData.rotationSpeed;

        // Önerilen konular yörünge hareketi
        customGroup.children.forEach((child) => {
          if (child.userData.orbitRadius) {
            const sphere = child as THREE.Mesh;
            sphere.userData.angle += sphere.userData.speed;
            sphere.position.x = Math.cos(sphere.userData.angle) * sphere.userData.orbitRadius;
            sphere.position.y = Math.sin(sphere.userData.angle) * sphere.userData.orbitRadius;
          }

          // Öğrenme ipuçları animasyonları
          if (child.userData.pulse) {
            child.userData.pulse += 0.05;
            const pulse = 1 + Math.sin(child.userData.pulse) * 0.2;
            child.scale.setScalar(pulse);
            child.rotation.y += child.userData.rotationSpeed;
          }

          // Parçacık yanıp sönme efekti
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        customGroup.rotation.y += customGroup.userData.rotationSpeed;
      }
      requestAnimationFrame(animateCustom);
    };
    animateCustom();
  };

  // Grafik / Plot / Fonksiyon için anlık 3D model oluşturucu (kullanıcının istediği gibi gerçek grafik)
  const createGraphModel = (modelPrompt: string) => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    const graphGroup = new THREE.Group();

    // Eksenler
    const axisMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const axisLength = 4;

    // X ekseni
    const xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, axisLength), axisMaterial);
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.x = axisLength / 2;
    graphGroup.add(xAxis);

    // Y ekseni
    const yAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, axisLength), axisMaterial);
    yAxis.position.y = axisLength / 2;
    graphGroup.add(yAxis);

    // Z ekseni
    const zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, axisLength), axisMaterial);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = axisLength / 2;
    graphGroup.add(zAxis);

    // Zemin grid (daha güzel görünüm için)
    const grid = new THREE.GridHelper(5, 10, 0x444466, 0x333355);
    grid.position.y = -0.01;
    graphGroup.add(grid);

    // Gerçek 3D yüzey / grafik (sin dalga yüzeyi - anlık oluşturuldu)
    const segments = 32;
    const geometry = new THREE.PlaneGeometry(4, 4, segments, segments);
    const positions = geometry.attributes.position as THREE.BufferAttribute;

    // Prompt'a göre basit fonksiyon seç (kullanıcı "sin grafiği", "parabol" vs. diyebilir)
    const promptLower = modelPrompt.toLowerCase();
    const isSin = promptLower.includes('sin') || promptLower.includes('dalga') || promptLower.includes('wave');
    const isParabola = promptLower.includes('parabol') || promptLower.includes('kare') || promptLower.includes('x^2');

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      let y = 0;

      if (isSin) {
        y = Math.sin(x * 1.2) * 0.8 + Math.cos(z * 1.5) * 0.5;
      } else if (isParabola) {
        y = (x * x + z * z) * 0.15 - 1.2;
      } else {
        // Genel güzel bir 3D yüzey (kullanıcı ne derse desin)
        y = Math.sin(x * 1.5) * Math.cos(z * 1.2) * 1.1;
        y += Math.sin(x * 0.7 + z) * 0.4;
      }

      positions.setY(i, y);
    }
    geometry.computeVertexNormals();

    const surfaceMat = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      shininess: 30,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const surface = new THREE.Mesh(geometry, surfaceMat);
    surface.rotation.x = -Math.PI / 2; // yatay yap
    surface.position.y = 0.1;
    surface.castShadow = true;
    surface.receiveShadow = true;
    graphGroup.add(surface);

    // Küçük nokta örnekleri (data points hissi)
    for (let i = 0; i < 25; i++) {
      const px = (Math.random() - 0.5) * 3.5;
      const pz = (Math.random() - 0.5) * 3.5;
      let py = Math.sin(px * 1.5) * Math.cos(pz * 1.2) * 1.1;
      if (isSin) {py = Math.sin(px * 1.2) * 0.8 + Math.cos(pz * 1.5) * 0.5;}
      if (isParabola) {py = (px * px + pz * pz) * 0.15 - 1.2;}

      const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        new THREE.MeshPhongMaterial({ color: 0xffdd44, emissive: 0x664400 })
      );
      point.position.set(px, py + 0.15, pz);
      graphGroup.add(point);
    }

    // Hafif animasyon (dalgalanma)
    graphGroup.userData = { rotationSpeed: 0.001, wavePhase: 0 };

    sceneRef.current.add(graphGroup);

    // Animasyon kaydı
    animatedMeshesRef.current.push(graphGroup);

    // Basit dalga animasyonu için
    const animateGraph = () => {
      if (graphGroup.userData) {
        graphGroup.userData.wavePhase = (graphGroup.userData.wavePhase || 0) + 0.03;
        // Yüzeyi hafifçe dalgalat
        const pos = surface.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          let baseY = Math.sin(x * 1.5) * Math.cos(z * 1.2) * 1.1;
          if (isSin) {baseY = Math.sin(x * 1.2) * 0.8 + Math.cos(z * 1.5) * 0.5;}
          if (isParabola) {baseY = (x * x + z * z) * 0.15 - 1.2;}

          const wave = Math.sin(graphGroup.userData.wavePhase + x * 0.5) * 0.12;
          pos.setY(i, baseY + wave);
        }
        pos.needsUpdate = true;
        surface.geometry.computeVertexNormals();
      }
      requestAnimationFrame(animateGraph);
    };
    animateGraph();
  };

  // Örnek 3D model oluşturma (fallback)
  const createSample3DModel = (modelPrompt: string) => {
    if (!sceneRef.current) {return;}
    clearAllModels();

    // Prompt'a göre farklı modeller
    if (modelPrompt.toLowerCase().includes('dna')) {
      createDNAModel();

    } else if (modelPrompt.toLowerCase().includes('atom')) {
      createAtomModel();

    } else if (modelPrompt.toLowerCase().includes('hücre') || modelPrompt.toLowerCase().includes('cell')) {
      createCellModel();

    } else if (
      modelPrompt.toLowerCase().match(/graph|grafik|plot|chart|fonksiyon|function|eğri|curve/)
    ) {
      createGraphModel(modelPrompt);

    } else {
      // Varsayılan animasyonlu model
      createAnimatedDefaultModel();
    }
  };

  // Much nicer default animated model (educational "molecule / energy" feel)
  const createAnimatedDefaultModel = () => {
    if (!sceneRef.current) {return;}

    const defaultGroup = new THREE.Group();

    // Central glowing core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 18),
      new THREE.MeshPhongMaterial({ color: 0x6677ff, emissive: 0x2233aa, shininess: 35 })
    );
    core.userData = { pulse: 0, pulseSpeed: 0.055, pulseAmp: 0.12 };
    defaultGroup.add(core);

    // Orbiting rings
    for (let r = 0; r < 2; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.6 + r * 0.7, 0.025, 5, 42),
        new THREE.MeshBasicMaterial({ color: (r === 0 ? 0x44ffcc : 0xff88dd), transparent: true, opacity: 0.5 })
      );
      ring.rotation.x = 0.6 + r;
      defaultGroup.add(ring);
    }

    // Orbiting small spheres (electrons / particles)
    for (let i = 0; i < 9; i++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12),
        new THREE.MeshPhongMaterial({ color: 0xaaffdd, emissive: 0x55aa99, emissiveIntensity: 0.6 })
      );
      orb.userData = {
        orbitRadius: 1.7 + (i % 3) * 0.65,
        speed: 0.023 + (i % 3) * 0.009,
        angle: i * 0.75,
        yOffset: (i % 2 - 0.5) * 0.9,
        yAmp: 0.25,
      };
      defaultGroup.add(orb);
      animatedMeshesRef.current.push(orb);
    }

    // Floating particles
    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.045),
        new THREE.MeshPhongMaterial({ color: 0xffee88, emissive: 0xffaa22, emissiveIntensity: 0.8 })
      );
      p.position.set(
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 3.5 + 0.5,
        (Math.random() - 0.5) * 4.5
      );
      p.userData = {
        blink: Math.random() * 6,
        blinkSpeed: 0.06 + Math.random() * 0.07,
        float: Math.random() * 5,
        floatSpeed: 0.015 + Math.random() * 0.02,
      };
      defaultGroup.add(p);
      animatedMeshesRef.current.push(p);
    }

    defaultGroup.userData = { rotationSpeed: 0.006 };
    sceneRef.current.add(defaultGroup);

    animatedMeshesRef.current.push(core);
    animatedMeshesRef.current.push(defaultGroup);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none">
      {/* Navigation Menu */}
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Bot className="w-10 h-10 text-blue-600 dark:text-purple-500" />
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('subtitle')}
          </p>
        </div>

        {/* AI Prompt Input */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('promptPlaceholder')}
              className="md:col-span-2 px-4 py-3 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            />
            <button
              onClick={() => {
                void generate3DModel();
              }}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('generating')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {t('generateButton')}
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('subjectPlaceholder')}
              className="px-4 py-3 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            />
            <Select
              value={complexity}
              onValueChange={(value) => setComplexity(value as ComplexityLevel)}
            >
              <SelectTrigger className="h-[50px] rounded-lg bg-white/80 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500">
                <SelectValue placeholder={t('complexity.medium')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">{t('complexity.simple')}</SelectItem>
                <SelectItem value="medium">{t('complexity.medium')}</SelectItem>
                <SelectItem value="complex">{t('complexity.complex')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

                     <div className="mt-4 flex flex-col sm:flex-row gap-3">
             <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
               <Lightbulb className="w-4 h-4 text-yellow-500" />
               {t('suggestions')}
             </div>
             <div className="flex gap-2 flex-wrap">
               <button
                 onClick={() => createDNAModel()}
                 className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
               >
                 {t('quickModels.dna')}
               </button>
               <button
                 onClick={() => createAtomModel()}
                 className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
               >
                 {t('quickModels.atom')}
               </button>
               <button
                 onClick={() => createCellModel()}
                 className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
               >
                 {t('quickModels.cell')}
               </button>
               <button
                 onClick={() => createHeartModel()}
                 className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
               >
                 {t('quickModels.heart') || 'Heart'}
               </button>
             </div>
           </div>
        </div>

                          {/* AI Response Display */}
         {aiResponse && (
           <div className="max-w-4xl mx-auto mb-8 border-gradient-question shadow-lg rounded-xl p-6">
             <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <Brain className="w-6 h-6 text-purple-600" />
               {t('aiResponse.title')}
             </h3>
             <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('aiResponse.answer')}</h4>
                 <p className="text-sm whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                   {aiResponse.response}
                 </p>
               </div>
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('aiResponse.confidence')}</h4>
                 <p className="text-sm">{(aiResponse.confidence * 100).toFixed(1)}%</p>
               </div>
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('aiResponse.suggestedTopics')}</h4>
                 <div className="flex flex-wrap gap-2">
                   {aiResponse.suggestedTopics.map((topic, index) => (
                     <span key={index} className="px-2 py-1 bg-blue-600/20 dark:bg-purple-600/20 rounded text-xs">
                       {topic}
                     </span>
                   ))}
                 </div>
               </div>
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('aiResponse.learningTips')}</h4>
                 <div className="space-y-1">
                   {aiResponse.learningTips.map((tip, index) => (
                     <p key={index} className="text-xs flex items-center gap-2">
                       <Lightbulb className="w-3 h-3 text-yellow-500" />
                       {tip}
                     </p>
                   ))}
                 </div>
               </div>
             </div>

           </div>
         )}

        {/* 3D Model Viewer - now dynamic, pretty and useful */}
        <div className="relative">
          <div
            ref={mountRef}
            className="w-full h-[620px] rounded-2xl border border-gray-300 dark:border-white/15 bg-[#0a0c12] overflow-hidden shadow-2xl"
          />

          {/* Floating 3D Controls Toolbar */}
          <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-2 bg-black/70 backdrop-blur-md border border-white/15 rounded-xl p-1.5 text-xs">
            <button
              onClick={() => {
                const cam = cameraRef.current;
                const ctrl = controlsRef.current;
                if (cam && ctrl) {
                  cam.position.set(0, 1.5, 5.5);
                  ctrl.target.set(0, 0.3, 0);
                  ctrl.update();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition"
              title="Reset camera view"
            >
              <Target className="w-3.5 h-3.5" /> {t('controls.reset')}
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${autoRotate ? 'bg-emerald-500/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title={t('controls.autoRotate')}
            >
              <Play className="w-3.5 h-3.5" /> {autoRotate ? t('controls.stopRotate') : t('controls.autoRotate')}
            </button>

            <button
              onClick={() => {
                const newWf = !wireframeMode;
                setWireframeMode(newWf);
                if (sceneRef.current) {
                  sceneRef.current.traverse((obj) => {
                    if (obj.type === 'Mesh') {
                      const mat = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
                      if (mat && 'wireframe' in mat) {mat.wireframe = newWf;}
                    }
                  });
                }
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${wireframeMode ? 'bg-amber-500/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title="Toggle wireframe / solid"
            >
              <Eye className="w-3.5 h-3.5" /> {wireframeMode ? t('controls.solid') : t('controls.wireframe')}
            </button>

            <div className="flex items-center gap-2 px-2 text-white/90">
              <span className="text-[10px] opacity-70">{t('controls.speed')}</span>
              <input
                type="range"
                min="0.2" max="3" step="0.1"
                value={animSpeed}
                onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                className="w-20 accent-purple-400"
              />
              <span className="font-mono text-[10px] w-6 text-right">{animSpeed.toFixed(1)}x</span>
            </div>
          </div>

          {aiResponse && (
            <div className="absolute top-3 left-3 bg-emerald-600/90 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow">
              <CheckCircle className="w-3.5 h-3.5" />
              {t('modelGenerated')}
            </div>
          )}

          <div className="absolute bottom-3 left-3 text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded pointer-events-none">
            {locale === 'tr' ? 'Sürükle: döndür • Tekerlek: zoom • Sağ sürükle: pan' : 'Drag to rotate • Scroll to zoom • Right-drag to pan'}
          </div>
        </div>

        {/* AI Özellikleri */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="border-gradient-question shadow-lg rounded-xl p-6">
            <div className="text-3xl mb-4 flex justify-center">
              <Brain className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('features.aiChatFlow.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('features.aiChatFlow.description')}
            </p>
          </div>

          <div className="border-gradient-question shadow-lg rounded-xl p-6">
            <div className="text-3xl mb-4 flex justify-center">
              <Palette className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('features.threeJs.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('features.threeJs.description')}
            </p>
          </div>

          <div className="border-gradient-question shadow-lg rounded-xl p-6">
            <div className="text-3xl mb-4 flex justify-center">
              <Zap className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('features.serverless.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('features.serverless.description')}
            </p>
          </div>
        </div>

        {/* Kullanım Talimatları */}
        <div className="mt-12 border-gradient-question shadow-lg rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            {t('howToUse.title')}
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                {t('howToUse.step1.title')}
              </h4>
              <p>{t('howToUse.step1.description')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                {t('howToUse.step2.title')}
              </h4>
              <p>{t('howToUse.step2.description')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                {t('howToUse.step3.title')}
              </h4>
              <p>{t('howToUse.step3.description')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                {t('howToUse.step4.title')}
              </h4>
              <p>{t('howToUse.step4.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
