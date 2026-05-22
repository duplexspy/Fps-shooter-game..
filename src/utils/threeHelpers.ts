/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Operator, Weapon, Attachment } from '../types';
import { ATTACHMENTS_DATA, WEAPON_SKINS } from '../data';

// Helper to get skin color
function getSkinHex(skinId: string): string {
  const s = WEAPON_SKINS.find(sk => sk.id === skinId);
  return s ? s.color : '#1B1C1D';
}

/**
 * Procedurally generates a futuristic, high-detail military operator 3D group.
 */
export function createProceduralOperator(op: Operator): THREE.Group {
  const group = new THREE.Group();
  group.name = `op_${op.id}`;

  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: new THREE.Color(op.skinColor), roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: new THREE.Color(op.hairColor), roughness: 0.8 }),
    armor: new THREE.MeshStandardMaterial({ color: new THREE.Color(op.armorColor), metalness: 0.2, roughness: 0.5 }),
    pants: new THREE.MeshStandardMaterial({ color: new THREE.Color(op.pantsColor), roughness: 0.7 }),
    gloves: new THREE.MeshStandardMaterial({ color: new THREE.Color(op.gloveColor), roughness: 0.8 }),
    backpack: new THREE.MeshStandardMaterial({ color: new THREE.Color(op.backpackColor), roughness: 0.6 }),
    visor: new THREE.MeshStandardMaterial({ color: '#00f0ff', metalness: 0.9, roughness: 0.1, emissive: '#004c55' }),
    steel: new THREE.MeshStandardMaterial({ color: '#333333', metalness: 0.6, roughness: 0.4 }),
    boots: new THREE.MeshStandardMaterial({ color: '#0c0c0d', roughness: 0.9 })
  };

  // TORSO (Body Vest)
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'TorsoGroup';

  const chestGeo = new THREE.BoxGeometry(0.6, 0.7, 0.4);
  const chestMesh = new THREE.Mesh(chestGeo, materials.armor);
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  torsoGroup.add(chestMesh);

  // Tactical gear plates on chest
  if (op.armorType === 'heavy_plate' || op.armorType === 'tactical_vest') {
    const plateGeo = new THREE.BoxGeometry(0.5, 0.4, 0.08);
    const plateMesh = new THREE.Mesh(plateGeo, materials.steel);
    plateMesh.position.set(0, 0.05, 0.21);
    torsoGroup.add(plateMesh);

    // Magazine pouches on vest
    for (let i = -1.5; i <= 1.5; i += 1.5) {
      if (i !== 0) {
        const pouchGeo = new THREE.BoxGeometry(0.12, 0.22, 0.08);
        const pouchMesh = new THREE.Mesh(pouchGeo, materials.backpack);
        pouchMesh.position.set(i * 0.12, -0.15, 0.23);
        torsoGroup.add(pouchMesh);
      }
    }
  }

  // NECK & HEAD
  const neckGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.15);
  const neckMesh = new THREE.Mesh(neckGeo, materials.skin);
  neckMesh.position.set(0, 0.425, 0);
  torsoGroup.add(neckMesh);

  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';
  headGroup.position.set(0, 0.6, 0);

  const skullGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const skullMesh = new THREE.Mesh(skullGeo, materials.skin);
  skullMesh.castShadow = true;
  headGroup.add(skullMesh);

  // Face Elements (Tactical Gear)
  if (op.headType === 'gas_mask') {
    // Gas Mask Core
    const maskGeo = new THREE.BoxGeometry(0.18, 0.2, 0.16);
    const maskMesh = new THREE.Mesh(maskGeo, materials.steel);
    maskMesh.position.set(0, -0.05, 0.14);
    headGroup.add(maskMesh);

    // Front filter cylinder
    const filterGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
    filterGeo.rotateX(Math.PI / 2);
    const filterMesh = new THREE.Mesh(filterGeo, materials.boots);
    filterMesh.position.set(0, -0.08, 0.24);
    headGroup.add(filterMesh);

    // Visor eye band (cyan glowing glass)
    const glassGeo = new THREE.BoxGeometry(0.28, 0.08, 0.1);
    const glassMesh = new THREE.Mesh(glassGeo, materials.visor);
    glassMesh.position.set(0, 0.05, 0.16);
    headGroup.add(glassMesh);
  } else if (op.headType === 'tactical_helmet') {
    // Helmet covering dome
    const helmetGeo = new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmetMesh = new THREE.Mesh(helmetGeo, materials.armor);
    helmetMesh.position.set(0, 0.04, 0);
    helmetMesh.scale.set(1.05, 1, 1.05);
    headGroup.add(helmetMesh);

    // Tactical Visor/Goggles
    const gogGeo = new THREE.BoxGeometry(0.26, 0.09, 0.12);
    const gogMesh = new THREE.Mesh(gogGeo, materials.visor);
    gogMesh.position.set(0, 0.06, 0.16);
    headGroup.add(gogMesh);

    // Strap
    const strapGeo = new THREE.BoxGeometry(0.04, 0.25, 0.25);
    const strapMesh = new THREE.Mesh(strapGeo, materials.boots);
    strapMesh.position.set(0, -0.1, 0.05);
    headGroup.add(strapMesh);
  } else if (op.headType === 'beret') {
    // Slanted beret box
    const beretGeo = new THREE.CylinderGeometry(0.25, 0.23, 0.09, 12);
    beretGeo.rotateZ(0.2);
    beretGeo.rotateY(0.4);
    const beretMesh = new THREE.Mesh(beretGeo, materials.boots); // Black/Navy
    beretMesh.position.set(0, 0.18, 0);
    headGroup.add(beretMesh);

    // Eye specs
    const eyeGeo = new THREE.BoxGeometry(0.24, 0.06, 0.08);
    const eyeMesh = new THREE.Mesh(eyeGeo, materials.visor);
    eyeMesh.position.set(0, 0.03, 0.18);
    headGroup.add(eyeMesh);
  } else {
    // Spec ops or cap
    const capGeo = new THREE.BoxGeometry(0.24, 0.08, 0.35);
    capGeo.rotateX(-0.1);
    const capMesh = new THREE.Mesh(capGeo, materials.armor);
    capMesh.position.set(0, 0.18, 0.06);
    headGroup.add(capMesh);

    const hairGeo = new THREE.BoxGeometry(0.24, 0.1, 0.2);
    const hairMesh = new THREE.Mesh(hairGeo, materials.hair);
    hairMesh.position.set(0, 0.1, -0.1);
    headGroup.add(hairMesh);
  }

  torsoGroup.add(headGroup);

  // BACKPACK
  if (op.backpackType !== 'none') {
    const isHeavy = op.backpackType === 'heavy';
    const packWidth = isHeavy ? 0.44 : 0.34;
    const packHeight = isHeavy ? 0.58 : 0.44;
    const packDepth = isHeavy ? 0.32 : 0.18;

    const packGeo = new THREE.BoxGeometry(packWidth, packHeight, packDepth);
    const packMesh = new THREE.Mesh(packGeo, materials.backpack);
    packMesh.castShadow = true;
    packMesh.position.set(0, 0.05, -(0.2 + packDepth / 2));
    torsoGroup.add(packMesh);

    if (isHeavy) {
      // Extra fuel tanks/loops on backpack
      const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
      const tankMesh = new THREE.Mesh(tankGeo, materials.steel);
      tankMesh.position.set(0.15, 0.05, -0.42);
      torsoGroup.add(tankMesh);
    }
  }

  group.add(torsoGroup);

  // LEGS AND BOOTS
  const leftLegPivot = new THREE.Group();
  leftLegPivot.name = 'LeftLegPivot';
  leftLegPivot.position.set(-0.2, -0.35, 0);

  const leftUpperLegGeo = new THREE.BoxGeometry(0.18, 0.44, 0.18);
  const leftUpperLeg = new THREE.Mesh(leftUpperLegGeo, materials.pants);
  leftUpperLeg.position.set(0, -0.22, 0);
  leftUpperLeg.castShadow = true;
  leftLegPivot.add(leftUpperLeg);

  // Knee pad
  const leftKneeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.06);
  const leftKnee = new THREE.Mesh(leftKneeGeo, materials.armor);
  leftKnee.position.set(0, -0.4, 0.1);
  leftLegPivot.add(leftKnee);

  const leftBootGeo = new THREE.BoxGeometry(0.16, 0.15, 0.24);
  const leftBoot = new THREE.Mesh(leftBootGeo, materials.boots);
  leftBoot.position.set(0, -0.52, 0.05);
  leftBoot.castShadow = true;
  leftLegPivot.add(leftBoot);

  group.add(leftLegPivot);

  // Right Leg Pivot
  const rightLegPivot = new THREE.Group();
  rightLegPivot.name = 'RightLegPivot';
  rightLegPivot.position.set(0.2, -0.35, 0);

  const rightUpperLegGeo = new THREE.BoxGeometry(0.18, 0.44, 0.18);
  const rightUpperLeg = new THREE.Mesh(rightUpperLegGeo, materials.pants);
  rightUpperLeg.position.set(0, -0.22, 0);
  rightUpperLeg.castShadow = true;
  rightLegPivot.add(rightUpperLeg);

  // Knee pad
  const rightKneeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.06);
  const rightKnee = new THREE.Mesh(rightKneeGeo, materials.armor);
  rightKnee.position.set(0, -0.4, 0.1);
  rightLegPivot.add(rightKnee);

  const rightBootGeo = new THREE.BoxGeometry(0.16, 0.15, 0.24);
  const rightBoot = new THREE.Mesh(rightBootGeo, materials.boots);
  rightBoot.position.set(0, -0.52, 0.05);
  rightBoot.castShadow = true;
  rightLegPivot.add(rightBoot);

  group.add(rightLegPivot);

  // ARMS (Left & Right configured for tactical gun-holding postures)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.name = 'LeftArmPivot';
  leftArmPivot.position.set(-0.38, 0.28, 0);

  const leftShoulderGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  const leftShoulder = new THREE.Mesh(leftShoulderGeo, materials.armor);
  leftArmPivot.add(leftShoulder);

  const leftArmGeo = new THREE.BoxGeometry(0.14, 0.38, 0.14);
  const leftArm = new THREE.Mesh(leftArmGeo, materials.armor);
  leftArm.position.set(0, -0.19, 0);
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);

  const leftForearmGeo = new THREE.BoxGeometry(0.12, 0.34, 0.12);
  const leftForearm = new THREE.Mesh(leftForearmGeo, materials.skin);
  leftForearm.position.set(0, -0.5, 0.05);
  leftForearm.rotation.x = -Math.PI / 4;
  leftArmPivot.add(leftForearm);

  const leftHandGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const leftHand = new THREE.Mesh(leftHandGeo, materials.gloves);
  leftHand.position.set(0, -0.66, 0.18);
  leftHand.rotation.x = -Math.PI / 4;
  leftArmPivot.add(leftHand);

  group.add(leftArmPivot);

  // Right Arm Pivot (Ready pointing forward)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.name = 'RightArmPivot';
  rightArmPivot.position.set(0.38, 0.28, 0);

  const rightShoulderGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  const rightShoulder = new THREE.Mesh(rightShoulderGeo, materials.armor);
  rightArmPivot.add(rightShoulder);

  const rightArmGeo = new THREE.BoxGeometry(0.14, 0.38, 0.14);
  const rightArm = new THREE.Mesh(rightArmGeo, materials.armor);
  rightArm.position.set(0, -0.19, 0);
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);

  const rightForearmGeo = new THREE.BoxGeometry(0.12, 0.34, 0.12);
  const rightForearm = new THREE.Mesh(rightForearmGeo, materials.skin);
  rightForearm.position.set(0, -0.45, 0.2);
  rightForearm.rotation.x = -Math.PI / 3;
  rightArmPivot.add(rightForearm);

  const rightHandGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const rightHand = new THREE.Mesh(rightHandGeo, materials.gloves);
  rightHand.position.set(0, -0.55, 0.35);
  rightHand.rotation.x = -Math.PI / 3;
  rightArmPivot.add(rightHand);

  group.add(rightArmPivot);

  // Elevate entire character slightly above floor
  group.position.y = 0.95;

  return group;
}

/**
 * Procedurally assembles a highly custom 3D military firearm.
 * Combines stock, heavy barrel, muzzle attachments, sights, triggers,
 * and magazine drums, reacting nicely to real-time gunsmith choices.
 */
export function createProceduralWeapon(wp: Weapon): THREE.Group {
  const group = new THREE.Group();
  group.name = `wp_${wp.id}`;

  const skinColor = getSkinHex(wp.currentSkin);
  const receiverColor = wp.currentSkin === 'none' ? '#242526' : skinColor;

  const materials = {
    steel: new THREE.MeshStandardMaterial({ color: receiverColor, metalness: 0.8, roughness: 0.25 }),
    blackSteel: new THREE.MeshStandardMaterial({ color: '#1B1C1D', metalness: 0.7, roughness: 0.4 }),
    tanPoly: new THREE.MeshStandardMaterial({ color: '#7E6D53', roughness: 0.7 }),
    wood: new THREE.MeshStandardMaterial({ color: '#5C3818', roughness: 0.8 }),
    lens: new THREE.MeshStandardMaterial({ color: '#00ffff', transparent: true, opacity: 0.6, emissive: '#002233' }),
    laserGlow: new THREE.MeshBasicMaterial({ color: '#00ff1e' }),
    redLaserGlow: new THREE.MeshBasicMaterial({ color: '#ff1100' }),
    gold: new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.9, roughness: 0.1 })
  };

  const modelMat = wp.currentSkin === 'gold_elite' ? materials.gold : materials.steel;

  // Let's customize layout bases based on Weapon Category
  const isSniper = wp.category === 'Sniper';
  const isPistol = wp.category === 'Pistol';
  const isShotgun = wp.category === 'Shotgun';
  const isSMG = wp.category === 'SMG';

  // RECEIVER (Gun Body Core)
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'Body';

  const bodyLength = isPistol ? 0.35 : isSniper ? 0.8 : 0.6;
  const bodyHeight = isPistol ? 0.12 : 0.16;
  const bodyWidth = isPistol ? 0.05 : 0.07;

  const receiverGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
  const receiverMesh = new THREE.Mesh(receiverGeo, modelMat);
  receiverMesh.castShadow = true;
  bodyGroup.add(receiverMesh);

  // Pistol grip handle
  const gripGeo = new THREE.BoxGeometry(bodyWidth - 0.01, 0.22, 0.06);
  gripGeo.rotateX(-0.25);
  const gripMesh = new THREE.Mesh(gripGeo, materials.blackSteel);
  gripMesh.position.set(0, -0.14, isPistol ? 0.05 : -0.1);
  gripMesh.castShadow = true;
  bodyGroup.add(gripMesh);

  // Scope Picatinny Rail on Top
  const railGeo = new THREE.BoxGeometry(0.04, 0.03, bodyLength * 0.7);
  const railMesh = new THREE.Mesh(railGeo, materials.blackSteel);
  railMesh.position.set(0, bodyHeight / 2 + 0.01, 0);
  bodyGroup.add(railMesh);

  // BARREL SYSTEM
  const barrelGroup = new THREE.Group();
  barrelGroup.name = 'BarrelGroup';

  const barrelLength = isSniper ? 1.0 : isPistol ? 0.18 : isShotgun ? 0.75 : 0.52;
  const barrelDia = isSniper ? 0.03 : isPistol ? 0.02 : 0.04;

  let barrelMeshLength = barrelLength;
  const isShortBarrel = wp.attachments.barrel === 'att_barrel_short';
  if (isShortBarrel) {
    barrelMeshLength = barrelLength * 0.6;
  }

  const barrelGeo = new THREE.CylinderGeometry(barrelDia, barrelDia, barrelMeshLength, 8);
  barrelGeo.rotateX(Math.PI / 2);
  const barrelMesh = new THREE.Mesh(barrelGeo, materials.blackSteel);

  // Position barrel sticking out of receiver
  const bPositionZ = bodyLength / 2 + barrelMeshLength / 2;
  barrelMesh.position.set(0, 0.02, bPositionZ);
  barrelMesh.castShadow = true;
  barrelGroup.add(barrelMesh);

  // Short handguard wrapper
  if (!isPistol) {
    const handguardLen = barrelMeshLength * 0.55;
    const guardGeo = new THREE.BoxGeometry(bodyWidth + 0.02, bodyHeight + 0.02, handguardLen);
    const guardMesh = new THREE.Mesh(guardGeo, materials.blackSteel);
    guardMesh.position.set(0, 0.01, bodyLength / 2 + handguardLen / 2);
    guardMesh.castShadow = true;
    barrelGroup.add(guardMesh);
  }

  bodyGroup.add(barrelGroup);

  // MUZZLE COMPENSATOR / SILENCER
  const muzzlePivot = new THREE.Group();
  muzzlePivot.name = 'MuzzlePivot';
  muzzlePivot.position.set(0, 0.02, bodyLength / 2 + barrelMeshLength);

  if (wp.attachments.muzzle) {
    const isSilencer = wp.attachments.muzzle === 'att_muzzle_suppressor';
    const mSize = isSilencer ? 0.06 : 0.045;
    const mLen = isSilencer ? 0.32 : 0.14;

    const mGeo = new THREE.CylinderGeometry(mSize, mSize, mLen, 8);
    mGeo.rotateX(Math.PI / 2);
    const mMesh = new THREE.Mesh(mGeo, materials.blackSteel);
    mMesh.position.set(0, 0, mLen / 2);
    mMesh.castShadow = true;
    muzzlePivot.add(mMesh);
  } else {
    // Basic small orange safety muzzle tip or standard steel tube tip
    const mGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.05, 8);
    mGeo.rotateX(Math.PI / 2);
    const mMesh = new THREE.Mesh(mGeo, materials.blackSteel);
    mMesh.position.set(0, 0, 0.025);
    muzzlePivot.add(mMesh);
  }
  bodyGroup.add(muzzlePivot);

  // STOCK (Gun Shoulder Backplate)
  const stockPivot = new THREE.Group();
  stockPivot.name = 'StockPivot';
  stockPivot.position.set(0, 0, -bodyLength / 2);

  if (!isPistol) {
    const hasSkeletonStock = wp.attachments.stock === 'att_stock_skeleton';
    const stockModelMat = hasSkeletonStock ? materials.blackSteel : modelMat;
    const stockLen = 0.45;

    if (hasSkeletonStock) {
      // Hollow triangular skeletal frame
      const frameGeo1 = new THREE.BoxGeometry(0.04, 0.04, stockLen);
      frameGeo1.rotateX(0.2);
      const subStock1 = new THREE.Mesh(frameGeo1, stockModelMat);
      subStock1.position.set(0, -0.05, -stockLen / 2);

      const frameGeo2 = new THREE.BoxGeometry(0.04, 0.04, stockLen);
      frameGeo2.rotateX(-0.2);
      const subStock2 = new THREE.Mesh(frameGeo2, stockModelMat);
      subStock2.position.set(0, 0.05, -stockLen / 2);

      const endCapGeo = new THREE.BoxGeometry(0.05, 0.22, 0.04);
      const endCap = new THREE.Mesh(endCapGeo, materials.blackSteel);
      endCap.position.set(0, 0, -stockLen);

      stockPivot.add(subStock1);
      stockPivot.add(subStock2);
      stockPivot.add(endCap);
    } else {
      // Robust standard solid dynamic military CTR stock
      const bufferTubeGeo = new THREE.CylinderGeometry(0.02, 0.02, stockLen, 8);
      bufferTubeGeo.rotateX(Math.PI / 2);
      const tubeMesh = new THREE.Mesh(bufferTubeGeo, materials.blackSteel);
      tubeMesh.position.set(0, 0.02, -stockLen / 2);
      stockPivot.add(tubeMesh);

      const buttGeo = new THREE.BoxGeometry(0.06, 0.20, 0.28);
      const buttMesh = new THREE.Mesh(buttGeo, stockModelMat);
      buttMesh.position.set(0, -0.04, -stockLen * 0.7);
      buttMesh.castShadow = true;
      stockPivot.add(buttMesh);
    }
  }
  bodyGroup.add(stockPivot);

  // MAGAZINE DRUM
  const magPivot = new THREE.Group();
  magPivot.name = 'MagPivot';
  const magPosZ = isPistol ? 0.05 : bodyLength * 0.15;
  magPivot.position.set(0, -bodyHeight / 2, magPosZ);

  const hasDrum = wp.attachments.magazine === 'att_mag_extended';
  if (hasDrum) {
    // Massive circular drum magazine
    const drumGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMesh = new THREE.Mesh(drumGeo, materials.blackSteel);
    drumMesh.position.set(0, -0.15, 0);
    drumMesh.castShadow = true;
    magPivot.add(drumMesh);
  } else {
    // Classic rectangular clip curvature
    const clipGeo = new THREE.BoxGeometry(0.04, 0.25, 0.08);
    clipGeo.rotateX(0.15);
    const clipMesh = new THREE.Mesh(clipGeo, materials.blackSteel);
    clipMesh.position.set(0, -0.12, 0.04);
    clipMesh.castShadow = true;
    magPivot.add(clipMesh);
  }
  bodyGroup.add(magPivot);

  // OPTICAL SIGHTS / SCOPES (Top Mounts)
  const opticsPivot = new THREE.Group();
  opticsPivot.name = 'OpticsPivot';
  opticsPivot.position.set(0, bodyHeight / 2 + 0.02, 0);

  if (wp.attachments.scope) {
    const sId = wp.attachments.scope;

    if (sId === 'att_red_dot') {
      // Holosun frame
      const redDotBaseGeo = new THREE.BoxGeometry(0.05, 0.04, 0.1);
      const rDotBase = new THREE.Mesh(redDotBaseGeo, materials.blackSteel);
      opticsPivot.add(rDotBase);

      const frameGeo = new THREE.BoxGeometry(0.05, 0.06, 0.02);
      const frame = new THREE.Mesh(frameGeo, materials.blackSteel);
      frame.position.set(0, 0.04, 0);
      opticsPivot.add(frame);

      const lensGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8);
      lensGeo.rotateX(Math.PI / 2);
      const lens = new THREE.Mesh(lensGeo, materials.lens);
      lens.position.set(0, 0.04, 0);
      opticsPivot.add(lens);
    } else if (sId === 'att_acog' || sId === 'att_sniper_8x') {
      // Professional metal long scope
      const tubeLen = sId === 'att_sniper_8x' ? 0.38 : 0.24;
      const baseScopeGeo = new THREE.CylinderGeometry(0.038, 0.03, tubeLen, 12);
      baseScopeGeo.rotateX(Math.PI / 2);
      const scopeTube = new THREE.Mesh(baseScopeGeo, materials.blackSteel);
      scopeTube.position.set(0, 0.08, 0);
      scopeTube.castShadow = true;
      opticsPivot.add(scopeTube);

      // Support brackets holding it down
      for (const offsetZ of [-0.08, 0.08]) {
        const bracketGeo = new THREE.BoxGeometry(0.03, 0.08, 0.03);
        const bracket = new THREE.Mesh(bracketGeo, materials.blackSteel);
        bracket.position.set(0, 0.04, offsetZ);
        opticsPivot.add(bracket);
      }

      // Front & rear bell flares
      const flareGeo = new THREE.CylinderGeometry(0.045, 0.036, 0.08, 12);
      flareGeo.rotateX(Math.PI / 2);
      const flare = new THREE.Mesh(flareGeo, materials.blackSteel);
      flare.position.set(0, 0.08, tubeLen / 2);
      opticsPivot.add(flare);

      // Colored lens glass
      const lensGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.005, 12);
      lensGeo.rotateX(Math.PI / 2);
      const lensMesh = new THREE.Mesh(lensGeo, materials.lens);
      lensMesh.position.set(0, 0.08, tubeLen / 2 + 0.003);
      opticsPivot.add(lensMesh);
    }
  } else if (!isPistol) {
    // Default Iron Sights
    const frontSightGeo = new THREE.BoxGeometry(0.01, 0.05, 0.02);
    const fs = new THREE.Mesh(frontSightGeo, materials.blackSteel);
    fs.position.set(0, 0.02, bodyLength / 2 - 0.05);
    opticsPivot.add(fs);

    const rearSightGeo = new THREE.BoxGeometry(0.02, 0.04, 0.02);
    const rs = new THREE.Mesh(rearSightGeo, materials.blackSteel);
    rs.position.set(0, 0.01, -bodyLength / 2 + 0.05);
    opticsPivot.add(rs);
  }
  bodyGroup.add(opticsPivot);

  // UNDERBARREL FOREGRIPS
  if (!isPistol && wp.attachments.grip) {
    const gripPivot = new THREE.Group();
    gripPivot.name = 'GripPivot';
    gripPivot.position.set(0, -bodyHeight / 2 - 0.01, bodyLength / 2 + 0.15);

    if (wp.attachments.grip === 'att_grip_vertical') {
      const gGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.15, 8);
      const gMesh = new THREE.Mesh(gGeo, materials.blackSteel);
      gMesh.position.set(0, -0.075, 0);
      gMesh.castShadow = true;
      gripPivot.add(gMesh);
    } else if (wp.attachments.grip === 'att_grip_angled') {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.18, 0);
      shape.lineTo(0.12, -0.08);
      shape.lineTo(0.02, -0.08);
      shape.closePath();

      const extrudeSettings = { depth: 0.04, bevelEnabled: false };
      const gGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      gGeo.center();
      const gMesh = new THREE.Mesh(gGeo, materials.blackSteel);
      gMesh.rotation.y = Math.PI / 2;
      gMesh.castShadow = true;
      gripPivot.add(gMesh);
    }
    bodyGroup.add(gripPivot);
  }

  // TACTICAL SIDE LASERS
  if (wp.attachments.laser) {
    const isGreen = wp.attachments.laser === 'att_laser_green';
    const laserColorMat = isGreen ? materials.laserGlow : materials.redLaserGlow;

    const laserBoxGeo = new THREE.BoxGeometry(0.04, 0.04, 0.12);
    const lBoxMesh = new THREE.Mesh(laserBoxGeo, materials.blackSteel);
    lBoxMesh.position.set(bodyWidth / 2 + 0.02, 0.02, bodyLength / 2 + 0.05);
    lBoxMesh.castShadow = true;
    bodyGroup.add(lBoxMesh);

    // Glowing laser projector lens rim
    const rLensGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8);
    rLensGeo.rotateX(Math.PI / 2);
    const rLensMesh = new THREE.Mesh(rLensGeo, laserColorMat);
    rLensMesh.position.set(bodyWidth / 2 + 0.02, 0.02, bodyLength / 2 + 0.05 + 0.06);
    bodyGroup.add(rLensMesh);
  }

  group.add(bodyGroup);

  // Position nicely around pivot point for rotation inspects
  group.position.set(0, 0, 0);

  return group;
}

/**
 * Procedurally draws a dynamic sky/background map depending on theme selected
 */
export function createMapEnvironment(theme: string): THREE.Group {
  const group = new THREE.Group();

  const floorMat = new THREE.MeshStandardMaterial({ color: '#1B1C1D', roughness: 0.8 });
  const blockMat1 = new THREE.MeshStandardMaterial({ color: '#2C2D2F', metalness: 0.1, roughness: 0.6 });
  const blockMat2 = new THREE.MeshStandardMaterial({ color: '#3A3B3D', metalness: 0.2, roughness: 0.5 });

  if (theme === 'desert') {
    floorMat.color.set('#D9B68A');
    blockMat1.color.set('#A6855B');
    blockMat2.color.set('#7C603D');
  } else if (theme === 'urban') {
    floorMat.color.set('#2E3033');
    blockMat1.color.set('#1E2022');
    blockMat2.color.set('#36454F');
  } else if (theme === 'industrial') {
    floorMat.color.set('#282E2E');
    blockMat1.color.set('#4B433F');
    blockMat2.color.set('#3B3532');
  } else if (theme === 'forest') {
    floorMat.color.set('#1B331F');
    blockMat1.color.set('#2A221C');
    blockMat2.color.set('#102113');
  }

  // Large floor
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Adding random visual obstacles, covers, targets, crates, pillars
  for (let i = 0; i < 35; i++) {
    const w = 1.0 + Math.random() * 2.5;
    const h = 1.5 + Math.random() * 4.0;
    const d = 1.0 + Math.random() * 2.5;

    const obstacleGeo = new THREE.BoxGeometry(w, h, d);
    const box = new THREE.Mesh(obstacleGeo, Math.random() > 0.5 ? blockMat1 : blockMat2);
    box.castShadow = true;
    box.receiveShadow = true;

    // Disperse block assets nicely around practice arena space
    const range = 45;
    const px = (Math.random() - 0.5) * range;
    const pz = (Math.random() - 0.5) * range;

    if (Math.abs(px) < 5 && Math.abs(pz) < 5) {
      continue; // Keep center spawn cleared
    }

    box.position.set(px, h / 2, pz);
    group.add(box);
  }

  // Practice target support rigs
  for (let t = 0; t < 6; t++) {
    const rigGroup = new THREE.Group();
    // support pillar
    const pilGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);
    const pillar = new THREE.Mesh(pilGeo, blockMat2);
    pillar.position.y = 0.9;
    rigGroup.add(pillar);

    // circular face target with bullseye ring
    const bullseyeMat = new THREE.MeshBasicMaterial({ color: '#E33333' });
    const ringsMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

    const targetPlateGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16);
    targetPlateGeo.rotateX(Math.PI / 2);
    const outerTarget = new THREE.Mesh(targetPlateGeo, ringsMat);
    outerTarget.position.set(0, 1.8, 0);
    outerTarget.name = 'target_plate';
    rigGroup.add(outerTarget);

    const innerTargetGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12);
    innerTargetGeo.rotateX(Math.PI / 2);
    const innerTarget = new THREE.Mesh(innerTargetGeo, bullseyeMat);
    innerTarget.position.set(0, 1.8, 0.01);
    rigGroup.add(innerTarget);

    // Position procedural targets in front of player
    rigGroup.position.set((t - 2.5) * 5, 0, 12 + Math.random() * 6);
    rigGroup.name = `target_rig_${t}`;
    group.add(rigGroup);
  }

  return group;
}
