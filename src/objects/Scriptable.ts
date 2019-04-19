import Project from '../Project';
import XMLDoc from '../XMLDoc';
import Costume from './Costume';
import Script from './Script';
import Sound from './Sound';
import VariableFrame from './VariableFrame';

export default class Scriptable {
    name: string;
    variables: VariableFrame;
    scripts: Script[];
    costumes: Costume[];
    sounds: Sound[];
    costumeIndex: number;

    readSB2(jsonObj: any, project: Project): Scriptable {
        const costumeObjs = jsonObj.costumes;
        const soundObjs = jsonObj.sounds;

        this.name = jsonObj.objName;
        this.costumes = [];
        if (costumeObjs != null) {
            for (const costumeObj of costumeObjs) {
                this.costumes.push(new Costume().readSB2(costumeObj, project));
            }
        }
        this.sounds = [];
        if (soundObjs != null) {
            for (const soundObj of soundObjs) {
                this.sounds.push(new Sound().readSB2(soundObj, project));
            }
        }
        this.costumeIndex = jsonObj.currentCostumeIndex + 1;

        return this;
    }

    costumesXML(xml: XMLDoc) {
        return xml.el('costumes', null, [
            xml.el('list', null, this.costumes.map(
                (costume) => xml.el('item', null, [costume.toXML(xml)]),
            )),
        ]);
    }

    soundsXML(xml: XMLDoc): Element {
        return xml.el('sounds', null, [
            xml.el('list'),
        ]);
    }

    blocksXML(xml: XMLDoc): Element {
        return xml.el('blocks');
    }

    scriptsXML(xml: XMLDoc): Element {
        return xml.el('scripts');
    }
}
