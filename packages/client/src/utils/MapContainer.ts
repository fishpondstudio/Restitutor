import { Container, type DisplayObject, ParticleContainer, type Sprite } from "pixi.js";

class OwnedChildMap<K, V extends DisplayObject> implements Iterable<[K, V]> {
   private readonly _map = new Map<K, V>();

   constructor(private readonly _owner: Container) {}

   public set(key: K, child: V): V {
      const oldChild = this._map.get(key);
      if (oldChild === child) {
         return child;
      }

      oldChild?.destroy({ children: true });
      this._map.set(key, child);
      this._owner.addChild(child);
      return child;
   }

   public delete(key: K): boolean {
      const child = this._map.get(key);
      if (!child) {
         return false;
      }

      this._map.delete(key);
      child.destroy({ children: true });
      return true;
   }

   public get(key: K): V | undefined {
      return this._map.get(key);
   }

   public has(key: K): boolean {
      return this._map.has(key);
   }

   public get size(): number {
      return this._map.size;
   }

   public clear(): void {
      for (const child of this._map.values()) {
         child.destroy({ children: true });
      }
      this._map.clear();
   }

   public [Symbol.iterator](): Iterator<[K, V]> {
      return this._map[Symbol.iterator]();
   }
}

export class MapContainer<K, V extends DisplayObject> extends Container {
   public readonly map = new OwnedChildMap<K, V>(this);
}

export class MapParticleContainer<K, V extends Sprite> extends ParticleContainer {
   public readonly map = new OwnedChildMap<K, V>(this);
}
