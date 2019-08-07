import Project from '../Project';
import XMLDoc from '../XMLDoc';
import BlockDefinition from './BlockDefinition';
import Costume from './Costume';
import Script from './Script';
import ScriptComment from './ScriptComment';
import Sound from './Sound';
import Stage from './Stage';
import VariableFrame from './VariableFrame';

export default class Scriptable {
    name: string;
    costumes: Costume[];
    sounds: Sound[];
    costumeIndex: number;
    variables: VariableFrame;
    blocks: BlockDefinition[];
    scripts: Array<Script | ScriptComment>;

    readSB2(jsonObj: any, project: Project): Scriptable {
        const costumeObjs = jsonObj.costumes;
        const soundObjs = jsonObj.sounds;
        const commentArrs = jsonObj.scriptComments;
        const scriptArrs = jsonObj.scripts;

        const blockComments = [];
        let nextBlockID = 0;

        this.name = jsonObj.objName;
        this.costumes = [];
        for (const costumeObj of costumeObjs) {
            this.costumes.push(new Costume().readSB2(costumeObj, project));
        }
        this.sounds = [];
        if (soundObjs != null) {
            for (const soundObj of soundObjs) {
                this.sounds.push(new Sound().readSB2(soundObj, project));
            }
        }
        this.costumeIndex = jsonObj.currentCostumeIndex + 1;

        this.readVariablesSB2(jsonObj, project);

        this.blocks = [];
        this.scripts = [];
        if (commentArrs != null) {
            for (const commentArr of commentArrs) {
                const blockID = commentArr[5];
                const comment = new ScriptComment().readSB2(commentArr);
                if (blockID === -1) {
                    this.scripts.push(comment);
                } else {
                    blockComments[blockID] = comment;
                }
            }
        }
        if (scriptArrs != null) {
            for (const scriptArr of scriptArrs) {
                const blockStackObj = scriptArr[2];
                const firstBlockObj = blockStackObj[0];
                const firstOp = firstBlockObj[0];
                if (firstOp === 'procDef') {
                    // let blockDef;
                    // [blockDef, nextBlockID] = new BlockDefinition().readSB2(
                    //     scriptObj, nextBlockID, blockComments, this.variables,
                    // );
                    // this.blocks.push(blockDef);
                } else {
                    let script;
                    [script, nextBlockID] = new Script().readSB2(
                        scriptArr, nextBlockID, blockComments, this.variables,
                    );
                    this.scripts.push(script);
                }
            }
        }

        return this;
    }

    readVariablesSB2(jsonObj: any, project: Project) {
        this.variables = new VariableFrame(project.globalVars);
    }

    readSB3(jsonObj: any, project: Project, libraryIndex: number): Scriptable {
        const costumeObjs = jsonObj.costumes;
        const soundObjs = jsonObj.sounds;
        const blockMap = jsonObj.blocks;

        this.name = jsonObj.name;
        this.costumes = [];
        for (const costumeObj of costumeObjs) {
            this.costumes.push(new Costume().readSB3(costumeObj, project));
        }
        this.sounds = [];
        for (const soundObj of soundObjs) {
            this.sounds.push(new Sound().readSB3(soundObj, project));
        }
        this.costumeIndex = jsonObj.currentCostume + 1;

        this.readVariablesSB3(jsonObj, project);

        this.blocks = [];
        this.scripts = [];
        for (const blockID in blockMap) {
            if (blockMap.hasOwnProperty(blockID)) {
                const blockObj: any = blockMap[blockID];
                if (blockObj.topLevel || Array.isArray(blockObj)) {
                    this.scripts.push(new Script().readSB3(blockID, blockMap, this.variables));
                }
            }
        }

        return this;
    }

    readVariablesSB3(jsonObj: any, project: Project) {
        this.variables = new VariableFrame(project.globalVars);
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
        return xml.el('scripts', null, this.scripts.map((scriptOrComment) => {
            if (scriptOrComment instanceof ScriptComment) {
                const comment: ScriptComment = scriptOrComment;
                return comment.toXML(xml);
            }
            const script: Script = scriptOrComment;
            return script.toXML(xml, this instanceof Stage, this.variables);
        }));
    }
}
