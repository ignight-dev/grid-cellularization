(() => {
  // src/HitboxTracker.ts
  var HitboxTracker = class {
    constructor() {
      // Keep track of all hitboxes
      this.hitboxes = {};
      // Will be using axis aligned bounding boxes
      // So we should track each axis separately
      this.axis = [[], []];
    }
    // Add a hitbox to the tracker
    addHitbox(id, hitbox) {
      const xMarker = this.addToAxis(this.axis[0], 0, id, hitbox.x, hitbox.x + hitbox.w);
      const yMarker = this.addToAxis(this.axis[1], 1, id, hitbox.y, hitbox.y + hitbox.h);
      const entry = {
        id,
        hitbox,
        axisRecords: [xMarker, yMarker]
      };
      this.hitboxes[id] = entry;
      const collideBoth = [...xMarker.overlap].filter((x) => yMarker.overlap.has(x));
      const collisionResult = {
        id,
        collideX: [...xMarker.overlap],
        collideY: [...yMarker.overlap],
        collided: collideBoth,
        collidedAny: collideBoth.length > 0
      };
      return collisionResult;
    }
    // Add a hitbox to the tracker for a specific axis
    addToAxis(axis, axisid, id, low, high) {
      const lowMarker = { id, markerId: 0, value: low };
      const highMarker = { id, markerId: 1, value: high };
      const initialOverlap = /* @__PURE__ */ new Set();
      let i;
      let j;
      for (i = 0; i < axis.length; i++) {
        if (axis[i].value > low)
          break;
        if (axis[i].markerId === 0) {
          initialOverlap.add(axis[i].id);
        } else {
          initialOverlap.delete(axis[i].id);
        }
      }
      axis.splice(i, 0, lowMarker);
      for (j = i + 1; j < axis.length; j++) {
        if (axis[j].value > high)
          break;
        if (axis[j].markerId === 0) {
          initialOverlap.add(axis[j].id);
        }
      }
      axis.splice(j, 0, highMarker);
      for (let k = i + 1; k < j; k++) {
        this.hitboxes[axis[k].id].axisRecords[axisid].markers[axis[k].markerId] += 1;
      }
      for (let k = j + 1; k < axis.length; k++) {
        this.hitboxes[axis[k].id].axisRecords[axisid].markers[axis[k].markerId] += 2;
      }
      for (const hitboxId of initialOverlap) {
        const hitbox = this.hitboxes[hitboxId];
        hitbox.axisRecords[axisid].overlap.add(id);
      }
      const result = {
        id: axisid,
        markers: [i, j],
        overlap: initialOverlap
      };
      return result;
    }
    // Get distance a hitbox can move before colliding with another
    // Assume movement is in one direction
    getDistanceToCollision(id, axis, maxDistance) {
      const entry = this.hitboxes[id];
      const targetAxis = this.axis[axis];
      const targetAxisRecord = entry.axisRecords[axis];
      const otherAxisRecord = entry.axisRecords[1 - axis];
      const shared = [...targetAxisRecord.overlap].filter((x) => otherAxisRecord.overlap.has(x));
      if (shared.length > 0)
        return 0;
      if (otherAxisRecord.overlap.size === 0)
        return maxDistance;
      const markerId = maxDistance > 0 ? 1 : 0;
      const increment = maxDistance > 0 ? 1 : -1;
      const absMaxDistance = Math.abs(maxDistance);
      const startingMarker = targetAxisRecord.markers[markerId];
      const startMarkerValue = targetAxis[startingMarker].value;
      for (let i = startingMarker + increment; i < targetAxis.length && i >= 0; i += increment) {
        const distance = targetAxis[i].value - startMarkerValue;
        if (distance > absMaxDistance) {
          return maxDistance;
        } else {
          if (otherAxisRecord.overlap.has(targetAxis[i].id)) {
            return distance * Math.sign(maxDistance);
          }
        }
      }
      return maxDistance;
    }
    // Moves a hitbox by a certain amount in a certain direction
    moveHitbox(id, axis, distance) {
      const entry = this.hitboxes[id];
      const targetAxis = this.axis[axis];
      const targetAxisRecord = entry.axisRecords[axis];
      let i;
      let j;
      const unOverlapped = /* @__PURE__ */ new Set();
      const nowOverlapped = /* @__PURE__ */ new Set();
      const increment = distance > 0 ? 1 : -1;
      const trailingEdgeId = distance > 0 ? 0 : 1;
      const leadingEdgeId = 1 - trailingEdgeId;
      const trailingEdgeIndex = targetAxisRecord.markers[trailingEdgeId];
      const trailingEdgeValue = targetAxis[trailingEdgeIndex].value;
      for (i = trailingEdgeIndex + increment; i < targetAxis.length && i >= 0; i += increment) {
        const marker = targetAxis[i];
        const distanceMoved = marker.value - trailingEdgeValue;
        if (Math.abs(distanceMoved) >= Math.abs(distance)) {
          i -= increment;
          break;
        }
        if (marker.markerId !== trailingEdgeId) {
          unOverlapped.add(marker.id);
        }
      }
      const leadingEdgeIndex = targetAxisRecord.markers[leadingEdgeId];
      const leadingEdgeValue = targetAxis[leadingEdgeIndex].value;
      for (j = leadingEdgeIndex + increment; j < targetAxis.length && j >= 0; j += increment) {
        const marker = targetAxis[j];
        const distanceMoved = marker.value - leadingEdgeValue;
        if (Math.abs(distanceMoved) >= Math.abs(distance)) {
          j -= increment;
          break;
        }
        if (marker.markerId !== leadingEdgeId) {
          nowOverlapped.add(marker.id);
        }
      }
      if (distance > 0) {
        for (let id2 = trailingEdgeIndex; id2 <= i; id2++) {
          this.hitboxes[targetAxis[id2].id].axisRecords[axis].markers[targetAxis[id2].markerId] -= 1;
        }
        for (let id2 = leadingEdgeIndex; id2 <= j; id2++) {
          this.hitboxes[targetAxis[id2].id].axisRecords[axis].markers[targetAxis[id2].markerId] -= 1;
        }
      } else {
        for (let id2 = trailingEdgeIndex; id2 >= i; id2--) {
          this.hitboxes[targetAxis[id2].id].axisRecords[axis].markers[targetAxis[id2].markerId] += 1;
        }
        for (let id2 = leadingEdgeIndex; id2 >= j; id2--) {
          this.hitboxes[targetAxis[id2].id].axisRecords[axis].markers[targetAxis[id2].markerId] += 1;
        }
      }
      for (const otherId of unOverlapped) {
        this.hitboxes[otherId].axisRecords[axis].overlap.delete(id);
        entry.axisRecords[axis].overlap.delete(otherId);
      }
      for (const otherId of nowOverlapped) {
        this.hitboxes[otherId].axisRecords[axis].overlap.add(id);
        entry.axisRecords[axis].overlap.add(otherId);
      }
      entry.axisRecords[axis].markers[trailingEdgeId] = i;
      entry.axisRecords[axis].markers[leadingEdgeId] = j;
      targetAxis.splice(i, 0, targetAxis.splice(trailingEdgeIndex, 1)[0]);
      targetAxis.splice(j, 0, targetAxis.splice(leadingEdgeIndex, 1)[0]);
      targetAxis[i].value += distance;
      targetAxis[j].value += distance;
      entry.hitbox[axis == 0 ? "x" : "y"] += distance;
    }
  };

  // src/index.ts
  console.clear();
  var tracker = new HitboxTracker();
  var hitbox1 = tracker.addHitbox("A", {
    x: 0,
    y: 0,
    w: 1,
    h: 1
  });
  var hitbox2 = tracker.addHitbox("B", {
    x: 1,
    y: 1,
    w: 1,
    h: 1
  });
  tracker.moveHitbox("A", 0, 0.5);
  tracker.moveHitbox("B", 1, -0.5);
  console.dir(tracker, { depth: null });
})();
