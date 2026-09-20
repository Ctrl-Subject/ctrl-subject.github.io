/* =========================================================
   NOVA-AI
   BACKGROUND / WORLD ENGINE

   Handles:
   - Day/night cycle
   - Sky
   - Stars
   - Sun
   - Moon
   - Distant mountains
   - Far hills
   - Main terrain
   - Terrain height
   - World item integration

   Day/night cycle:
   24 minutes = one complete cycle
========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas =
    document.getElementById(
        "backgroundCanvas"
    );

const ctx =
    canvas.getContext(
        "2d"
    );


let width = 0;
let height = 0;


/* =========================================================
   SETTINGS
========================================================= */

const CYCLE_LENGTH =
    24 * 60 * 1000;


/*
   Render internally at a lower resolution,
   then scale to the actual screen.

   This gives the world a subtle pixel-art
   appearance while keeping it scalable.
*/

const PIXEL_SCALE = 4;


/* =========================================================
   TERRAIN
========================================================= */

let terrain = [];

let terrainWidth = 0;

let terrainBaseHeight = 0;


/* =========================================================
   DAY/NIGHT CYCLE
========================================================= */

let cycleStart =
    localStorage.getItem(
        "novaCycleStart"
    );


if (!cycleStart) {

    cycleStart =
        Date.now();

    localStorage.setItem(
        "novaCycleStart",
        cycleStart
    );

}
else {

    cycleStart =
        Number(
            cycleStart
        );

}


/* =========================================================
   RESET CYCLE
========================================================= */

function resetNovaCycle() {

    cycleStart =
        Date.now();

    localStorage.setItem(
        "novaCycleStart",
        cycleStart
    );

}


/* =========================================================
   RESIZE
========================================================= */

function resizeCanvas() {

    width =
        window.innerWidth;

    height =
        window.innerHeight;


    /*
       Internal resolution.
    */

    canvas.width =
        Math.ceil(
            width /
            PIXEL_SCALE
        );


    canvas.height =
        Math.ceil(
            height /
            PIXEL_SCALE
        );


    /*
       Display resolution.
    */

    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    /*
       Terrain base.

       The terrain begins around the
       lower portion of the screen.
    */

    terrainBaseHeight =
        canvas.height *
        0.84;


    /*
       Generate terrain.
    */

    generateTerrain();


    /*
       Regenerate world objects.

       The safety check means background.js
       will still work if items.js has not
       loaded yet.
    */

    if (
        typeof generateWorldItems ===
        "function"
    ) {

        generateWorldItems(

            canvas.width,

            canvas.height

        );

    }

}


/* =========================================================
   TERRAIN GENERATION
========================================================= */

function generateTerrain() {

    terrain = [];


    terrainWidth =
        canvas.width;


    /*
       Deterministic random generator.

       This keeps the terrain stable
       between refreshes.
    */

    let seed =
        12345;


    function random() {

        seed =
            (
                seed *
                9301 +

                49297
            ) %

            233280;


        return (
            seed /
            233280
        );

    }


    /*
       Larger distance between control
       points = smoother terrain.
    */

    const pointCount =
        Math.ceil(
            terrainWidth /
            45
        );


    const points = [];


    /*
       Generate control points.
    */

    for (
        let i = 0;

        i < pointCount;

        i++
    ) {

        points.push({

            height:

                (
                    random() -
                    0.5
                )

                *

                canvas.height *
                0.08

        });

    }


    /*
       Interpolate between control points.
    */

    for (
        let x = 0;

        x < terrainWidth;

        x++
    ) {

        const position =
            x / 45;


        const index =
            Math.floor(
                position
            );


        const amount =
            position -
            index;


        const a =
            points[
                Math.min(
                    index,
                    points.length - 1
                )
            ].height;


        const b =
            points[
                Math.min(
                    index + 1,
                    points.length - 1
                )
            ].height;


        /*
           Smoothstep interpolation.
        */

        const smooth =
            amount *
            amount *
            (
                3 -
                2 *
                amount
            );


        terrain[x] =

            terrainBaseHeight -

            (
                a +

                (
                    b -
                    a
                ) *

                smooth
            );

    }

}


/* =========================================================
   GET TERRAIN HEIGHT
========================================================= */

function getTerrainHeight(
    x
) {

    if (
        terrain.length === 0
    ) {

        return terrainBaseHeight;

    }


    x =
        Math.floor(
            x
        );


    x =
        Math.max(

            0,

            Math.min(

                terrain.length - 1,

                x

            )

        );


    return terrain[x];

}


/* =========================================================
   DAY/NIGHT PROGRESS
========================================================= */

function getCycleProgress() {

    const elapsed =

        (
            Date.now() -
            cycleStart
        )

        %

        CYCLE_LENGTH;


    return (

        elapsed /
        CYCLE_LENGTH

    );

}


/* =========================================================
   COLOUR UTILITIES
========================================================= */

function lerp(
    a,
    b,
    amount
) {

    return (

        a +

        (
            b -
            a
        )

        *

        amount

    );

}


function smoothstep(
    amount
) {

    return (

        amount *
        amount *

        (
            3 -
            2 *
            amount
        )

    );

}


function hexToRGB(
    hex
) {

    return {

        r:
            parseInt(
                hex.slice(
                    1,
                    3
                ),
                16
            ),

        g:
            parseInt(
                hex.slice(
                    3,
                    5
                ),
                16
            ),

        b:
            parseInt(
                hex.slice(
                    5,
                    7
                ),
                16
            )

    };

}


function rgbToHex(
    r,
    g,
    b
) {

    return (

        "#" +

        Math.round(
            r
        )
        .toString(
            16
        )
        .padStart(
            2,
            "0"
        ) +

        Math.round(
            g
        )
        .toString(
            16
        )
        .padStart(
            2,
            "0"
        ) +

        Math.round(
            b
        )
        .toString(
            16
        )
        .padStart(
            2,
            "0"
        )

    );

}


function blendColor(
    colourA,
    colourB,
    amount
) {

    const a =
        hexToRGB(
            colourA
        );


    const b =
        hexToRGB(
            colourB
        );


    return rgbToHex(

        lerp(
            a.r,
            b.r,
            amount
        ),

        lerp(
            a.g,
            b.g,
            amount
        ),

        lerp(
            a.b,
            b.b,
            amount
        )

    );

}


/* =========================================================
   SKY COLOUR STATES
========================================================= */

const SKY = [

    {
        progress: 0.00,

        top: "#071326",

        middle: "#10294A",

        bottom: "#254B6E"
    },


    {
        progress: 0.15,

        top: "#162A46",

        middle: "#405B76",

        bottom: "#826779"
    },


    {
        progress: 0.25,

        top: "#648FB0",

        middle: "#D98970",

        bottom: "#F3B36B"
    },


    {
        progress: 0.35,

        top: "#4EA4E8",

        middle: "#87CEEB",

        bottom: "#C8F0FF"
    },


    {
        progress: 0.50,

        top: "#3D9FEA",

        middle: "#87CEEB",

        bottom: "#D7F5FF"
    },


    {
        progress: 0.65,

        top: "#4EA4E8",

        middle: "#87CEEB",

        bottom: "#C8F0FF"
    },


    {
        progress: 0.75,

        top: "#685B99",

        middle: "#D66E5C",

        bottom: "#F2A45F"
    },


    {
        progress: 0.85,

        top: "#17203A",

        middle: "#253E5E",

        bottom: "#3A5870"
    },


    {
        progress: 1.00,

        top: "#071326",

        middle: "#10294A",

        bottom: "#254B6E"
    }

];


/* =========================================================
   GET SKY COLOURS
========================================================= */

function getSkyColours(
    progress
) {

    let first =
        SKY[0];


    let second =
        SKY[1];


    for (
        let i = 0;

        i <
        SKY.length - 1;

        i++
    ) {

        if (

            progress >=
            SKY[i].progress

            &&

            progress <=
            SKY[i + 1].progress

        ) {

            first =
                SKY[i];


            second =
                SKY[i + 1];


            break;

        }

    }


    let amount =

        (
            progress -
            first.progress
        )

        /

        (
            second.progress -
            first.progress
        );


    amount =
        smoothstep(

            Math.max(

                0,

                Math.min(
                    1,
                    amount
                )

            )

        );


    return {

        top:

            blendColor(

                first.top,

                second.top,

                amount

            ),


        middle:

            blendColor(

                first.middle,

                second.middle,

                amount

            ),


        bottom:

            blendColor(

                first.bottom,

                second.bottom,

                amount

            )

    };

}


/* =========================================================
   DRAW SKY
========================================================= */

function drawSky(
    progress
) {

    const colours =
        getSkyColours(
            progress
        );


    const gradient =
        ctx.createLinearGradient(

            0,

            0,

            0,

            canvas.height

        );


    gradient.addColorStop(
        0,
        colours.top
    );


    gradient.addColorStop(
        0.5,
        colours.middle
    );


    gradient.addColorStop(
        1,
        colours.bottom
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

}


/* =========================================================
   STARS
========================================================= */

let stars = [];


function createStars() {

    stars = [];


    const amount =

        Math.floor(

            (
                canvas.width *
                canvas.height
            )

            /

            250

        );


    for (
        let i = 0;

        i < amount;

        i++
    ) {

        stars.push({

            x:

                Math.random() *
                canvas.width,


            y:

                Math.random() *
                canvas.height *
                0.65,


            size:

                Math.random() < 0.9

                    ? 1

                    : 2,


            brightness:

                0.5 +

                Math.random() *
                0.5,


            phase:

                Math.random() *
                Math.PI *
                2

        });

    }

}


/* =========================================================
   STAR OPACITY
========================================================= */

function getStarOpacity(
    progress
) {

    if (
        progress < 0.15
    ) {

        return 1;

    }


    if (
        progress < 0.25
    ) {

        return (

            1 -

            (
                progress -
                0.15
            )

            /

            0.10

        );

    }


    if (
        progress < 0.75
    ) {

        return 0;

    }


    if (
        progress < 0.85
    ) {

        return (

            progress -
            0.75

        )

        /

        0.10;

    }


    return 1;

}


/* =========================================================
   DRAW STARS
========================================================= */

function drawStars(
    progress
) {

    const opacity =
        getStarOpacity(
            progress
        );


    if (
        opacity <= 0
    ) {

        return;

    }


    for (
        const star of stars
    ) {

        const twinkle =

            0.75 +

            Math.sin(

                performance.now() *
                0.001 +

                star.phase

            )

            *

            0.25;


        ctx.globalAlpha =

            opacity *

            star.brightness *

            twinkle;


        ctx.fillStyle =
            "#FFFFFF";


        ctx.fillRect(

            Math.floor(
                star.x
            ),

            Math.floor(
                star.y
            ),

            star.size,

            star.size

        );

    }


    ctx.globalAlpha =
        1;

}


/* =========================================================
   SUN POSITION
========================================================= */

function getSunPosition(
    progress
) {

    const sunrise =
        0.20;


    const sunset =
        0.75;


    if (

        progress <
        sunrise

        ||

        progress >
        sunset

    ) {

        return null;

    }


    const p =

        (
            progress -
            sunrise
        )

        /

        (
            sunset -
            sunrise
        );


    const angle =
        p *
        Math.PI;


    return {

        x:

            canvas.width *
            p,


        y:

            canvas.height *
            0.78

            -

            Math.sin(
                angle
            )

            *

            canvas.height *
            0.62

    };

}


/* =========================================================
   DRAW SUN
========================================================= */

function drawSun(
    progress
) {

    const sun =
        getSunPosition(
            progress
        );


    if (!sun) {

        return;

    }


    let opacity = 1;


    if (
        progress < 0.25
    ) {

        opacity =

            (
                progress -
                0.20
            )

            /

            0.05;

    }


    if (
        progress > 0.70
    ) {

        opacity =

            (
                0.75 -
                progress
            )

            /

            0.05;

    }


    opacity =

        Math.max(

            0,

            Math.min(
                1,
                opacity
            )

        );


    ctx.globalAlpha =
        opacity;


    /*
       Sun glow.
    */

    const glow =

        ctx.createRadialGradient(

            sun.x,

            sun.y,

            2,

            sun.x,

            sun.y,

            25

        );


    glow.addColorStop(

        0,

        "rgba(255,240,130,0.65)"

    );


    glow.addColorStop(

        1,

        "rgba(255,210,80,0)"

    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();


    ctx.arc(

        sun.x,

        sun.y,

        25,

        0,

        Math.PI * 2

    );


    ctx.fill();


    /*
       Sun.
    */

    ctx.fillStyle =
        "#FFE45C";


    ctx.beginPath();


    ctx.arc(

        sun.x,

        sun.y,

        9,

        0,

        Math.PI * 2

    );


    ctx.fill();


    ctx.globalAlpha =
        1;

}


/* =========================================================
   MOON POSITION
========================================================= */

function getMoonPosition(
    progress
) {

    let p;


    if (
        progress >= 0.75
    ) {

        p =

            (
                progress -
                0.75
            )

            /

            0.45;

    }
    else {

        p =

            (
                progress +
                0.25
            )

            /

            0.45;

    }


    p =

        Math.max(

            0,

            Math.min(
                1,
                p
            )

        );


    const angle =
        p *
        Math.PI;


    return {

        x:

            canvas.width *
            p,


        y:

            canvas.height *
            0.78

            -

            Math.sin(
                angle
            )

            *

            canvas.height *
            0.62

    };

}


/* =========================================================
   DRAW MOON
========================================================= */

function drawMoon(
    progress
) {

    let opacity = 0;


    if (

        progress >= 0.75

        &&

        progress < 0.85

    ) {

        opacity =

            (
                progress -
                0.75
            )

            /

            0.10;

    }

    else if (

        progress >= 0.85

        ||

        progress < 0.15

    ) {

        opacity = 1;

    }

    else if (

        progress >= 0.15

        &&

        progress < 0.25

    ) {

        opacity =

            1 -

            (
                progress -
                0.15
            )

            /

            0.10;

    }


    if (
        opacity <= 0
    ) {

        return;

    }


    const moon =
        getMoonPosition(
            progress
        );


    ctx.globalAlpha =
        opacity;


    /*
       Glow.
    */

    const glow =

        ctx.createRadialGradient(

            moon.x,

            moon.y,

            2,

            moon.x,

            moon.y,

            22

        );


    glow.addColorStop(

        0,

        "rgba(245,245,210,0.25)"

    );


    glow.addColorStop(

        1,

        "rgba(245,245,210,0)"

    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();


    ctx.arc(

        moon.x,

        moon.y,

        22,

        0,

        Math.PI * 2

    );


    ctx.fill();


    /*
       Moon.
    */

    ctx.fillStyle =
        "#F4F1D0";


    ctx.beginPath();


    ctx.arc(

        moon.x,

        moon.y,

        8,

        0,

        Math.PI * 2

    );


    ctx.fill();


    /*
       Craters.
    */

    ctx.fillStyle =
        "#D6D3B4";


    ctx.fillRect(

        Math.floor(
            moon.x - 4
        ),

        Math.floor(
            moon.y - 2
        ),

        2,

        2

    );


    ctx.fillRect(

        Math.floor(
            moon.x + 2
        ),

        Math.floor(
            moon.y + 3
        ),

        2,

        2

    );


    ctx.fillRect(

        Math.floor(
            moon.x + 2
        ),

        Math.floor(
            moon.y - 4
        ),

        1,

        1

    );


    ctx.globalAlpha =
        1;

}


/* =========================================================
   DISTANT MOUNTAINS
========================================================= */

function drawMountains() {

    const base =
        canvas.height *
        0.72;


    ctx.fillStyle =
        "#466B72";


    /*
       Extend beyond both sides of the
       visible canvas so the landscape
       never drops off at the edges.
    */

    const startX =
        -canvas.width;


    const endX =
        canvas.width * 2;


    ctx.beginPath();


    ctx.moveTo(

        startX,

        canvas.height

    );


    for (

        let x = startX;

        x <= endX;

        x += 20

    ) {

        const wave =

            Math.sin(
                x * 0.008
            )

            *

            canvas.height *
            0.06;


        const wave2 =

            Math.sin(
                x * 0.017
            )

            *

            canvas.height *
            0.025;


        const y =

            base -
            wave -
            wave2;


        ctx.lineTo(

            x,

            y

        );

    }


    ctx.lineTo(

        endX,

        canvas.height

    );


    ctx.lineTo(

        startX,

        canvas.height

    );


    ctx.closePath();


    ctx.fill();

}


/* =========================================================
   FAR HILLS
========================================================= */

function drawFarHills() {

    const base =
        canvas.height *
        0.78;


    ctx.fillStyle =
        "#568C55";


    /*
       Extend beyond both sides of the
       visible canvas so the hills remain
       continuous.
    */

    const startX =
        -canvas.width;


    const endX =
        canvas.width * 2;


    ctx.beginPath();


    ctx.moveTo(

        startX,

        canvas.height

    );


    for (

        let x = startX;

        x <= endX;

        x += 10

    ) {

        const hill =

            Math.sin(
                x * 0.006
            )

            *

            canvas.height *
            0.055;


        const hill2 =

            Math.sin(
                x * 0.014
            )

            *

            canvas.height *
            0.018;


        const y =

            base -
            hill -
            hill2;


        ctx.lineTo(

            x,

            y

        );

    }


    ctx.lineTo(

        endX,

        canvas.height

    );


    ctx.lineTo(

        startX,

        canvas.height

    );


    ctx.closePath();


    ctx.fill();

}


/* =========================================================
   MAIN TERRAIN
========================================================= */

function drawTerrain() {

    if (
        terrain.length === 0
    ) {

        return;

    }


    /*
       =====================================================
       DEEP STONE
       =====================================================

       Bottom-most terrain layer.
    */

    ctx.fillStyle =
        "#45483F";


    ctx.beginPath();


    ctx.moveTo(

        0,

        getTerrainHeight(0)

    );


    for (
        let x = 0;

        x < terrain.length;

        x++
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x)

        );

    }


    ctx.lineTo(

        canvas.width,

        canvas.height

    );


    ctx.lineTo(

        0,

        canvas.height

    );


    ctx.closePath();

    ctx.fill();


    /*
       =====================================================
       DEEP SOIL
       =====================================================

       Increased from 20% to 30% of the
       internal canvas height.
    */

    ctx.fillStyle =
        "#4F3828";


    ctx.beginPath();


    ctx.moveTo(

        0,

        getTerrainHeight(0)

    );


    for (
        let x = 0;

        x < terrain.length;

        x++
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x)

        );

    }


    /*
       Move deeper into the ground.

       30% gives the lower soil layer
       considerably more depth.
    */

    for (
        let x =
            terrain.length - 1;

        x >= 0;

        x--
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x) +
            canvas.height * 0.30

        );

    }


    ctx.closePath();

    ctx.fill();


    /*
       =====================================================
       MAIN DIRT
       =====================================================
    */

    ctx.fillStyle =
        "#76502F";


    ctx.beginPath();


    ctx.moveTo(

        0,

        getTerrainHeight(0)

    );


    for (
        let x = 0;

        x < terrain.length;

        x++
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x)

        );

    }


    for (
        let x =
            terrain.length - 1;

        x >= 0;

        x--
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x) +
            canvas.height * 0.075

        );

    }


    ctx.closePath();

    ctx.fill();


    /*
       =====================================================
       DIRT SHADING
       =====================================================
    */

    ctx.fillStyle =
        "#69462C";


    ctx.beginPath();


    ctx.moveTo(

        0,

        getTerrainHeight(0) +
        canvas.height * 0.035

    );


    for (
        let x = 0;

        x < terrain.length;

        x++
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x) +
            canvas.height * 0.035

        );

    }


    for (
        let x =
            terrain.length - 1;

        x >= 0;

        x--
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x) +
            canvas.height * 0.075

        );

    }


    ctx.closePath();

    ctx.fill();


    /*
       =====================================================
       GRASS TOP
       =====================================================
    */

    ctx.fillStyle =
        "#4E9A3E";


    ctx.beginPath();


    ctx.moveTo(

        0,

        getTerrainHeight(0)

    );


    for (
        let x = 0;

        x < terrain.length;

        x++
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x)

        );

    }


    for (
        let x =
            terrain.length - 1;

        x >= 0;

        x--
    ) {

        ctx.lineTo(

            x,

            getTerrainHeight(x) + 3

        );

    }


    ctx.closePath();

    ctx.fill();


    /*
       =====================================================
       GRASS HIGHLIGHTS
       =====================================================
    */

    ctx.fillStyle =
        "#63AA4B";


    for (
        let x = 0;

        x < terrain.length;

        x += 7
    ) {

        const y =
            getTerrainHeight(x);


        if (
            Math.sin(
                x * 0.17
            ) > 0.25
        ) {

            ctx.fillRect(

                x,

                Math.floor(y),

                2,

                1

            );

        }

    }


    /*
       =====================================================
       SMALL DIRT / STONE DETAILS
       =====================================================
    */

    for (
        let x = 12;

        x < terrain.length;

        x += 19
    ) {

        const y =
            getTerrainHeight(x);


        const variation =
            Math.sin(
                x * 0.731
            );


        /*
           Dirt detail.
        */

        if (
            variation > 0.25
        ) {

            ctx.fillStyle =
                "#60432D";


            ctx.fillRect(

                x,

                Math.floor(

                    y +
                    canvas.height *
                    0.045

                ),

                2,

                2

            );

        }


        /*
           Stone detail.
        */

        if (
            variation < -0.35
        ) {

            ctx.fillStyle =
                "#686A60";


            ctx.fillRect(

                x + 3,

                Math.floor(

                    y +
                    canvas.height *
                    0.12

                ),

                2,

                2

            );

        }

    }

}


/* =========================================================
   MAIN ANIMATION
========================================================= */

function animate() {

    const progress =
        getCycleProgress();


    const time =
        performance.now();


    /*
       SKY
    */

    drawSky(
        progress
    );


    /*
       STARS
    */

    drawStars(
        progress
    );


    /*
       SUN
    */

    drawSun(
        progress
    );


    /*
       MOON
    */

    drawMoon(
        progress
    );


    /*
       DISTANT LANDSCAPE
    */

    drawMountains();

    drawFarHills();


    /*
       MAIN TERRAIN
    */

    drawTerrain();


    /*
       WORLD ITEMS

       Trees, flowers, grass, bushes,
       rocks, etc.
    */

    if (
        typeof drawWorldItems ===
        "function"
    ) {

        drawWorldItems(

            ctx,

            getTerrainHeight(

                Math.floor(
                    canvas.width / 2
                )

            ),

            time

        );

    }


    /*
       Continue rendering.
    */

    requestAnimationFrame(
        animate
    );

}


/* =========================================================
   INITIALISATION
========================================================= */

window.addEventListener(

    "resize",

    resizeCanvas

);


/*
   Initial canvas setup.
*/

resizeCanvas();


/*
   Generate stars after canvas
   dimensions are known.
*/

createStars();


/*
   Start rendering.
*/

animate();