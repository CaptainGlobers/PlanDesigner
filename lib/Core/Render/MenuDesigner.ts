import { ColorConfig } from './ColorConfig';
import { IGroup, IPath, Point, Group, IPoint, IRaster, Raster, PointText, Path, Size, IPointText } from '../Primitive/Primitive';
import { GraphicsSettings } from './GraphicsSettings';

export class MenuDesigner {

    public static drawMenu(count: number, width: number, hight: number): Array<IGroup> {
        const menu: IPath = Path.Rectangle(new Point(0, 0), new Point(width, 40));
        menu.fillColor = ColorConfig.button;

        // TODO: del dependencies
        const menuGroup: IGroup = new Group([menu]);
        // TODO: del dependencies
        GraphicsSettings.current.menu = menu;

        return MenuDesigner.drawMenuItemInner(count, width, hight, menu, menuGroup);
    }

    private static drawMenuItemInner(count: number, width: number, hight: number, menu: any, menuGroup: IGroup): Array<IGroup> {
        const menuItem: Array<IGroup> = [];
        const point1: IPoint = new Point(0, 0);
        const margin: number = 5;
        const heightItem: number = hight - margin;
        const widthItem: number = 100;

        menuItem.push(menuGroup);

        const fillLayer: IPath = Path.Rectangle(new Point(0, 0), new Point(width, 40));
        fillLayer.fillColor = ColorConfig.button;
        fillLayer.insertAbove(menuGroup);

        let i: number;
        for (i = 0; i < count; i++) {
            const icon: IRaster = Raster.create('icon/menu' + i + '.png', new Point(point1.x + 18, point1.y + 18), 0.25);
            const point2: IPoint = new Point(point1.x + widthItem, point1.y + heightItem);
            const button: IPath = Path.Rectangle(point1, point2);
            button.fillColor = ColorConfig.button;
            const outSelect: IPath =
                Path.Rectangle(point1, new Point(point1.x + widthItem, point1.y + heightItem + 4 * 20));
            const text: PointText =
                PointText.create(new Point(point1.x + 35, point1.y + 22), 'left', ColorConfig.menuText, ``);
            const subMenu: IGroup =
                (i === 2) ? MenuDesigner.drawSubMenu(5, point1.x, 250) : MenuDesigner.drawSubMenu(5, point1.x);
            subMenu.visible = false;

            const group: IGroup = new Group([outSelect, button, text, subMenu, icon]);

            group.onMouseEnter = function (event: MouseEvent): void {
                this.children[1].fillColor = ColorConfig.menuMouseEnter;
                this.children[3].visible = true;
                document.body.style.cursor = 'pointer';
                this.children[0].fillColor = ColorConfig.transparent;
            };

            group.onMouseLeave = function (event: MouseEvent): void {
                this.children[1].fillColor = ColorConfig.button;
                this.children[3].visible = false;
                document.body.style.cursor = 'default';
                this.children[0].fillColor = ColorConfig.transparent;
            };
            menuItem.push(group);
            point1.x = point1.x + margin + widthItem;
        }

        return menuItem;
    }

    public static drawLeftMenu(count: number): Array<IGroup> {
        return MenuDesigner.drawLeftMenuInner(count);
    }

    private static drawLeftMenuInner(count: number): Array<IGroup> {
        const menu: Array<IGroup> = [];
        const point1: IPoint = new Point(0, 120);
        const margin: number = 0;
        const heightItem: number = 40;
        const widthItem: number = 40;

        for (let i: number = 0; i < count; i++) {
            const icon: IRaster =
                Raster.create('icon/leftMenu' + i + '.png', new Point(point1.x + 20, point1.y + 20), 0.25);

            const group: IGroup = MenuDesigner.drawMenuItem(point1, widthItem, heightItem, icon);
            group.onMouseEnter = function (event: MouseEvent): void {
                this.children[0].fillColor = ColorConfig.menuMouseEnter;
                document.body.style.cursor = 'pointer';
            };
            group.onMouseLeave = function (event: MouseEvent): void {
                this.children[0].fillColor = ColorConfig.button;
                document.body.style.cursor = 'default';
            };

            menu.push(group);
            point1.y = point1.y + margin + heightItem;
        }
        return menu;
    }

    public static drawMenuItem(point1: IPoint, width: number, height: number, icon?: IRaster): IGroup {
        const point2: IPoint = new Point(point1.x + width, point1.y + height);
        const button: IPath = Path.Rectangle(point1, point2);
        button.fillColor = ColorConfig.button;

        let text: PointText;
        if (icon) {
            text = PointText.create(new Point(point1.x + 20, point1.y + 27), 'center', ColorConfig.menuText, '', 24);
        } else {
            text = PointText.create(new Point(point1.x + 10, point1.y + 13), 'left', ColorConfig.menuText, ``);
        }

        return icon ? new Group([button, icon, text]) : new Group([button, text]);
    }

    public static drawSubMenu(count: number, positionStartX: number, widthItem: number = 120): IGroup {
        const point1: IPoint = new Point(positionStartX, 40);
        const heightItem: number = 20;

        const subMenuItems: Array<IGroup> = [];
        for (let i: number = 0; i < count; i++) {
            const subMenuItem: IGroup = MenuDesigner.drawMenuItem(point1, widthItem, heightItem);
            subMenuItem.onMouseEnter = function (event: MouseEvent): void {
                this.children[0].fillColor = ColorConfig.menuMouseEnter;
            };

            subMenuItem.onMouseLeave = function (event: MouseEvent): void {
                this.children[0].fillColor = ColorConfig.button;
            };

            subMenuItems.push(subMenuItem);
            point1.y = point1.y + heightItem;
        }

        const subMenu: IGroup = new Group();
        subMenu.addChildren(subMenuItems);
        return subMenu;
    }

    public static drawStartMenu(center: IPoint): IGroup {
        const width: number = 400;
        const height: number = 200;

        const rect: IPath =
            Path.Rectangle(new Point(center.x - width / 2, center.y - height / 2), new Size(width, height));
        rect.fillColor = ColorConfig.button;

        const icon1: IRaster =
            Raster.create('icon/start0.png', new Point(center.x - width / 4, center.y + 10), 0.5, 0.5);
        const icon2: IRaster =
            Raster.create('icon/start1.png', new Point(center.x + width / 4, center.y + 10), 0.6, 0.5);

        const iconMouseEnterHandler: Function = (elem: IRaster) => {
            elem.opacity = 1;
            document.body.style.cursor = 'pointer';
        };

        const iconMouseLeaveHandler: Function = (elem: IRaster) => {
            elem.opacity = 0.5;
            document.body.style.cursor = 'default';
        };

        icon2.onMouseEnter = () => iconMouseEnterHandler(icon2);
        icon2.onMouseLeave = () => iconMouseLeaveHandler(icon2);
        icon1.onMouseEnter = () => iconMouseEnterHandler(icon1);
        icon1.onMouseLeave = () => iconMouseLeaveHandler(icon1);

        const text1: IPointText = PointText.create(
            new Point(center.x - width / 4, center.y - height / 2 + 30), 'center', ColorConfig.menuText, '', 20
        );

        const text2: IPointText = PointText.create(
            new Point(center.x + width / 4, center.y - height / 2 + 30), 'center', ColorConfig.menuText, '', 20
        );

        return new Group([rect, text1, icon1, text2, icon2]);
    }
}