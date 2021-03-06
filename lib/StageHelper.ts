import { ILevel } from './Core/ILevel';
import { DataConverter } from './Core/DataConverter/DataConverter';

export class StageHelper {
    public static loadProject(onloadFn: (e: any) => void): void {
        const fileReader: FileReader = new FileReader();
        fileReader.onload = (e: any) => onloadFn(e); //this.initProject(e.target.result);
        fileReader.onerror = (e: any) => alert('File not read ' + e.target.error.code);

        const input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.onchange = () => fileReader.readAsText(input.files[0]);
        input.click();
    }

    public static saveProject(levels: Array<ILevel>): void {
        // TODO: blocked by security
        const filename: string = 'pro.json';
        const data: string = DataConverter.getJson(levels);

        const form: HTMLFormElement = document.createElement('form');
        const input: HTMLInputElement = document.createElement('input');
        input.type = 'submit';
        form.appendChild(input);
        form.onsubmit = (e: Event) => {
            event.preventDefault();
            const foo: any = (window as any).saveAs;
            foo(new Blob([data]), filename);
        }
        input.click();
    }
}