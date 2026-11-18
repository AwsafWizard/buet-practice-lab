// Aeration / gas transfer (CE 331 T04): ln[(Cs − Ct)/(Cs − C0)] = −K_L a t.
/** time to reach Ct (same time unit as 1/(K a)) */
export const aerationTime = (p: { C0: number; Ct: number; Cs: number; Ka: number }) => Math.log((p.Cs - p.Ct) / (p.Cs - p.C0)) / -p.Ka
export const aerationConc = (p: { C0: number; Cs: number; Ka: number; t: number }) => p.Cs - (p.Cs - p.C0) * Math.exp(-p.Ka * p.t)
/** K from one reading: C(t1) known */
export const aerationK = (p: { C0: number; Ct: number; Cs: number; t: number }) => Math.log((p.Cs - p.C0) / (p.Cs - p.Ct)) / p.t
