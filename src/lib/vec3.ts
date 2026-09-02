/** A position or direction in world space, in metres. */
export type Vec3 = readonly [number, number, number]

/** Rotates a point about the Y axis. */
export function rotateY(point: Vec3, radians: number): Vec3 {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  return [point[0] * cos + point[2] * sin, point[1], -point[0] * sin + point[2] * cos]
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
