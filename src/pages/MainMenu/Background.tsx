import bg1_21_0 from "../../assets/imgs/panoramas/1.21_panorama_0.png"
import bg1_21_1 from "../../assets/imgs/panoramas/1.21_panorama_1.png"
import bg1_21_2 from "../../assets/imgs/panoramas/1.21_panorama_2.png"
import bg1_21_3 from "../../assets/imgs/panoramas/1.21_panorama_3.png"
import bg1_21_4 from "../../assets/imgs/panoramas/1.21_panorama_4.png"
import bg1_21_5 from "../../assets/imgs/panoramas/1.21_panorama_5.png"

import bg1_20_0 from "../../assets/imgs/panoramas/1.20_panorama_0.png"
import bg1_20_1 from "../../assets/imgs/panoramas/1.20_panorama_1.png"
import bg1_20_2 from "../../assets/imgs/panoramas/1.20_panorama_2.png"
import bg1_20_3 from "../../assets/imgs/panoramas/1.20_panorama_3.png"
import bg1_20_4 from "../../assets/imgs/panoramas/1.20_panorama_4.png"
import bg1_20_5 from "../../assets/imgs/panoramas/1.20_panorama_5.png"

import bg1_19_0 from "../../assets/imgs/panoramas/1.19_panorama_0.png"
import bg1_19_1 from "../../assets/imgs/panoramas/1.19_panorama_1.png"
import bg1_19_2 from "../../assets/imgs/panoramas/1.19_panorama_2.png"
import bg1_19_3 from "../../assets/imgs/panoramas/1.19_panorama_3.png"
import bg1_19_4 from "../../assets/imgs/panoramas/1.19_panorama_4.png"
import bg1_19_5 from "../../assets/imgs/panoramas/1.19_panorama_5.png"

import bg1_17_0 from "../../assets/imgs/panoramas/1.17_panorama_0.png"
import bg1_17_1 from "../../assets/imgs/panoramas/1.17_panorama_1.png"
import bg1_17_2 from "../../assets/imgs/panoramas/1.17_panorama_2.png"
import bg1_17_3 from "../../assets/imgs/panoramas/1.17_panorama_3.png"
import bg1_17_4 from "../../assets/imgs/panoramas/1.17_panorama_4.png"
import bg1_17_5 from "../../assets/imgs/panoramas/1.17_panorama_5.png"

import bg1_16_0 from "../../assets/imgs/panoramas/1.16_panorama_0.png"
import bg1_16_1 from "../../assets/imgs/panoramas/1.16_panorama_1.png"
import bg1_16_2 from "../../assets/imgs/panoramas/1.16_panorama_2.png"
import bg1_16_3 from "../../assets/imgs/panoramas/1.16_panorama_3.png"
import bg1_16_4 from "../../assets/imgs/panoramas/1.16_panorama_4.png"
import bg1_16_5 from "../../assets/imgs/panoramas/1.16_panorama_5.png"
import { useState } from "react"

let panoramass = [
    [bg1_21_0, bg1_21_1, bg1_21_2, bg1_21_3, bg1_21_4, bg1_21_5],
    [bg1_20_0, bg1_20_1, bg1_20_2, bg1_20_3, bg1_20_4, bg1_20_5],
    [bg1_19_0, bg1_19_1, bg1_19_2, bg1_19_3, bg1_19_4, bg1_19_5],
    [bg1_17_0, bg1_17_1, bg1_17_2, bg1_17_3, bg1_17_4, bg1_17_5],
    [bg1_16_0, bg1_16_1, bg1_16_2, bg1_16_3, bg1_16_4, bg1_16_5]
]

function randomizepanoramas(){
    return panoramass[Math.floor(Math.random() * panoramass.length)]
}

export function Background() {
    const [panorama] = useState(randomizepanoramas())
    return <div id="background">
        {panorama.map((imgs, index) => (
            <img key={index} id={`panoramaPicture${index}`} className="panoramaPicture" src={imgs} alt={`panoramaPicture${index}`} />
        ))}
    </div>
}