import {loadGLTF, loadAudio} from "./applications/libs/loader.js";
//import {mockWithVideo} from './applications/libs/camera-mock.js';
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    //mockWithVideo('./applications/assets/mock-videos/musicband1.mp4');

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './applications/assets/targets/musicband.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const raccoon = await loadGLTF("./applications/assets/models/joe_biden_dancing/scene.gltf");
    raccoon.scene.scale.set(1, 1, 1);
    raccoon.scene.position.set(0, -0.4, 0);
    //raccoon.scene.rotation.set(90 ,0, 0);

    const bear = await loadGLTF("./applications/assets/models/donald_trump_dancing/scene.gltf");
    bear.scene.scale.set(1, 1, 1);
    bear.scene.position.set(0, -0.4, 0);
    //bear.scene.rotation.set(90 ,0, 0);

    const raccoonAnchor = mindarThree.addAnchor(0);
    raccoonAnchor.group.add(raccoon.scene);

    const bearAnchor = mindarThree.addAnchor(1);
    bearAnchor.group.add(bear.scene);

    ///////////////////////////////////////////////////////////////////////////////////////////////

    const raccoonAudioClip = await loadAudio("./applications/assets/sounds/Paradise-Found.wav");
    const bearAudioClip = await loadAudio("./applications/assets/sounds/Number-One.wav");

    const raccoonListener = new THREE.AudioListener();
    const raccoonAudio = new THREE.PositionalAudio(raccoonListener);

    const bearListener = new THREE.AudioListener();
    const bearAudio = new THREE.PositionalAudio(bearListener);

    camera.add(raccoonListener);
    raccoonAnchor.group.add(raccoonAudio);

    camera.add(bearListener);
    bearAnchor.group.add(bearAudio);

    raccoonAudio.setRefDistance(1000);
    raccoonAudio.setBuffer(raccoonAudioClip);
    raccoonAudio.setLoop(true);

    bearAudio.setRefDistance(1000);
    bearAudio.setBuffer(bearAudioClip);
    bearAudio.setLoop(true);

    raccoonAnchor.onTargetFound = () => {
      raccoonAudio.play();
    }
    raccoonAnchor.onTargetLost = () => {
      raccoonAudio.pause();
      //raccoonAudio.stop();
    }

    bearAnchor.onTargetFound = () => {
      bearAudio.play();
    }
    bearAnchor.onTargetLost = () => {
      bearAudio.pause();
      //raccoonAudio.stop();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////

    //gltf Animation
    const raccoonMixer = new THREE.AnimationMixer(raccoon.scene);
    const raccoonAction = raccoonMixer.clipAction(raccoon.animations[0]);
    raccoonAction.play();

    const bearMixer = new THREE.AnimationMixer(bear.scene);
    const bearAction = bearMixer.clipAction(bear.animations[0]);
    bearAction.play();

    const clock = new THREE.Clock();

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      //raccoon.scene.rotation.set(0, gltf.scene.rotation.y + delta, 0);
      raccoonMixer.update(delta);
      bearMixer.update(delta);
      renderer.render(scene, camera);
    });
  }
  start();
});
