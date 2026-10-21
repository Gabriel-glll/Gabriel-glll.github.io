import React from 'react';

type Pt = [number, number];

// Resolve o sistema 8x8 da homografia que leva o retângulo (0,0)-(w,h) para o quadrilátero dado.
const homography = (w: number, h: number, [p0, p1, p2, p3]: [Pt, Pt, Pt, Pt]) => {
  const src: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const dst = [p0, p1, p2, p3];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // eliminação de Gauss
  for (let c = 0; c < 8; c++) {
    let piv = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    [b[c], b[piv]] = [b[piv], b[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const [a, bb, c, d, e, f, g, hh] = b.map((v, i) => v / A[i][i]);
  // matrix3d é coluna-major
  return `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
};

// Coloca qualquer conteúdo (vídeo, site, imagem) dentro de 4 cantos com perspectiva.
// Os cantos são em pixels do elemento pai (ordem: sup-esq, sup-dir, inf-dir, inf-esq).
export const CornerPin: React.FC<{
  width: number; // tamanho "nativo" do conteúdo
  height: number;
  corners: [Pt, Pt, Pt, Pt];
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width, height, corners, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width,
      height,
      transformOrigin: '0 0',
      transform: homography(width, height, corners),
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);
