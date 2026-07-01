import { Container, type DisplayObject } from "pixi.js";

export class IndexedContainer<K, V extends DisplayObject> extends Container {
   private _map = new Map<K, V>();

   public set(key: K, child: V): V {
      const oldChild = this._map.get(key);
      if (oldChild) {
         oldChild.destroy({ children: true });
      }
      this._map.set(key, child);
      return this.addChild(child);
   }

   public delete(key: K): boolean {
      const child = this._map.get(key);
      if (child) {
         child.destroy({ children: true });
         return this._map.delete(key);
      }
      return false;
   }

   public get(key: K): V | undefined {
      return this._map.get(key);
   }

   public has(key: K): boolean {
      return this._map.has(key);
   }

   [Symbol.iterator](): Iterator<[K, V]> {
      return this._map[Symbol.iterator]();
   }

   public size(): number {
      return this._map.size;
   }

   public clear(): void {
      for (const [key, child] of this._map.entries()) {
         child.destroy({ children: true });
      }
      this._map.clear();
   }
}
