import { Identifiable } from "../model/game/abstract/Identifiable";
import { Identifier } from "../model/game/abstract/Identifier";
import { Selectable as ISelectable } from "../model/game/abstract/Selectable";
import { SimpleId as SimpleIdentifier } from "../model/game/ids/SimpleId";

namespace JQuerySelectable {

    export function ofClass(className:string) {
        return new Class(className);
    }

    export function ofElement(elementName:string) {
        return new Element(elementName);
    }

    export function ofId(idName:string) {
        return new SimpleId(idName);
    }

    export function from(selectable:Selectable) {
        return Builder.from(selectable);
    }

    export function fromClass(className:string) {
        return Builder.from(new Class(className));
    }

    export function fromElement(elementName:string) {
        return Builder.from(new Element(elementName));
    }

    export abstract class Selectable implements ISelectable {
        abstract readonly selector: string;
        protected constructor(asString:string) {
            this.toString = () => asString;
        }
        get jquery() {
            return $(this.selector);
        }
    
    }

    class Element extends Selectable {
        readonly selector: string
        constructor(element: string) {
            super("<"+element+"/>");
            this.selector = element;
        }
    }
    
    interface ICollection {
        selectables: Selectable[];
    }

    abstract class Collection extends Selectable implements ICollection {
        readonly selector:string;
        readonly selectables:Selectable[];
        protected constructor(nameSeparator:string, selectorSeparator:string, first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(Array.of(first, second, ...more).map(c => c instanceof Collection ? "("+c.toString()+")" : c.toString()).join(nameSeparator));
            this.selectables = Array.of(first, second, ...more);
            this.selector = this.selectables.map(c => c.selector).join(selectorSeparator);
        }
    }

    abstract class AClassSelector extends Selectable {
        constructor(name:string) {
            super(name);
        }
        protected get classList(): string {
            return this.toString();
        }
        addTo(s:ISelectable) {
            return $(s.selector).addClass(this.classList);
        }
        removeFrom(s:ISelectable) {
            return $(s.selector).removeClass(this.classList);
        }
    }

    class Class extends AClassSelector {
        readonly selector: string;
        constructor(name:string) {
            super(name);
            this.selector = "."+name;
        }
    }

    class ClassCollection extends AClassSelector implements ICollection {
        private readonly _delegate: Collection;
        constructor(delegate:Collection) {
            super(delegate.toString());
            // TODO verify all members are classes
            this._delegate  = delegate;
        }
        protected get classList(): string {
            return this._delegate.selectables.join(" ");
        }
        getClass(index:number) {
            return this._delegate.selectables[index] as AClassSelector;
        }
        get selectables() {
            return this._delegate.selectables;
        }
        get selector(): string {
            return this._delegate.selector;
        }
    }
    
    class Builder {
        private _product:Selectable;
        private constructor(initial:Selectable) {
            this._product = initial;
        }
    
        public static from(selectable:Selectable) {
            return new Builder(selectable);
        }
    
        public build() {
            return this._product;
        }

        public buildClassCollection() {
            if (this._product instanceof Collection) {
                return new ClassCollection(this._product);
            }
            throw "Not a collection";
        }

        public and(selectable:Selectable) {
            this._product = new Conjunction(this._product, selectable);
            return this;
        }
        
        public andClass(className:string) {
            return this.and(new Class(className));
        }
    
        public or(selectable:Selectable) {
            this._product = new Disjunction(this._product, selectable);
            return this;
        }

        public orClass(className:string) {
            return this.or(new Class(className));
        }
    
        public decendent(decendent:Selectable) {
            this._product = new DecendentHeirarchy(this._product, decendent);
            return this;
        }

        public decendentClass(className:string) {
            return this.decendent(new Class(className));
        }
    
        public child(child:Selectable) {
            this._product = new DirectDecendentHeirarchy(this._product, child);
            return this;
        }
    
        public childClass(className:string) {
            return this.child(new Class(className));
        }
    
        public childElement(elementName:string) {
            return this.child(new Element(elementName));
        }
    }

    class Disjunction extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" | ", ", ", first, second, ...more);
        }
    }
    
    class Conjunction extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" & ", "", first, second, ...more);
        }
    }
    
    class DecendentHeirarchy extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" ", " ", first, second, ...more);
        }
    }
    
    class DirectDecendentHeirarchy extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" > ", " > ", first, second, ...more);
        }
    }

    export abstract class Id<ID extends Identifier> extends Selectable implements Identifiable<ID> {
        readonly abstract id: ID;
        constructor(id:string) {
            super(id);
        }
        get selector() {
            return this.id.selector;
        }
    }
    
    class SimpleId extends Id<SimpleIdentifier> {
        id: SimpleIdentifier;
        constructor(id:string) {
            super(id);
            this.id = SimpleIdentifier.get(id);
        }
    }
}

export default JQuerySelectable;