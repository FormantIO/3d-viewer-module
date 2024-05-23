import { Color, EllipseCurve, Vector3 } from "three";
import { Line } from "@react-three/drei";
import { FormantColors } from "../utils/FormantColors";

const range = (start: number, end: number) =>
    end <= start ? [] : new Array(end - start).fill(0).map((_, i) => i + start);


export function PolarGrid({ majorCircleColor = new Color(0x2e3854), minorCircleColor = new Color(0x364060) }) {
    const lines: JSX.Element[] = [];

    range(-1, 2).forEach((magnitude: number, index: number) => {
        const first = index === 0;
        range(first ? 1 : 3, 21).forEach(i => {
            const major = i === 10;
            const r = Math.pow(10, magnitude) * i;
            lines.push(
                <Line
                    key={`line-${magnitude}-${i}`}
                    points={generatePoints(r, 36)}
                    color={!major ? majorCircleColor : minorCircleColor}
                    lineWidth={major ? 0.7 : 0.5}
                    opacity={0.5}
                    dashed={false}
                    depthTest={true}
                />
            );
        });
    });

    return <group renderOrder={1}>{lines}</group>;
}

function generatePoints(radius: number, segments: number) {
    const curve = new EllipseCurve(
        0,
        0,
        radius,
        radius,
        0,
        2 * Math.PI,
        false,
        0
    );
    const points = curve.getPoints(segments).map(point => new Vector3(point.x, point.y, 0));
    return [...points];
}