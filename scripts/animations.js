
export function startRoundAnimation(choices) {
    // make animation
    const tl = gsap.timeline();
    // set initial positions
    choices[0].position.x = -2.5;  // rock
    choices[0].position.y = 6
    choices[1].position.x = 0;  // paper
    choices[1].position.y = 6
    choices[2].position.x = 2.5;  // scissors
    choices[2].position.y = 6
    // make blocks go down into screen
    choices.forEach(choice => tl.to(choice.position, {duration:0.6, y:0}, 0));

    return Promise.resolve(tl);
}

export function afterSelectAnimation(choice, others) {
    // play animation
    const tl = gsap.timeline(); // create timeline
    // float other choices away
    others.forEach(item => {tl.to(item.position, {duration: 1, y: "+=6"}, 0.1);});
    // move picked choice to center and then left
    tl.to(choice.position, {duration: 0.7, x: 0, z: 2}, 0.6)
      .to(choice.position, {duration: 0.7, x: -2, z: 0}, 2);

    return Promise.resolve(tl);
}

export function oponentArriveAnimation(oponent) {
    // set initial position
    oponent.position.x = 2;
    oponent.position.y = 6;
    tw = gsap.to(oponent.position, {duration: 1, y: 0});
    return Promise.resolve(tl);
}