import React from "react";
import { ForceGraph2D } from "react-force-graph";
import empImage from '../resources/employee.png'
import company from '../resources/company.png'
class DisplayNode extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodeData: {},
            imageMap: '',
            clicked: false,
            highlightNodes: new Set(),
            highlightLinks: new Set()
        }
    }

    componentDidMount() {
        let orgData =this.props.orgData;
        var nodes = [];
        var employeeData = []
        var nodex = -500;
        var nodey = -250;
        var links = [];
        orgData.forEach((data, index) => {
            data.members.forEach((employee) => {
                if (employeeData.length > 0) {
                    var indexdata = employeeData.findIndex((emp) => emp.members.id === employee.din)
                    if (indexdata === -1) {
                        employeeData.push(
                            {
                                members: {
                                    id: employee.din,
                                    name: employee.name,
                                    isClusterNode: true,
                                    size: 9.785932721712538,
                                    img: empImage,
                                    x: nodex,
                                    y: nodey,
                                }
                                ,
                                org: [
                                    {
                                        id: data.organization.cin,
                                        name: data.organization.name,
                                        centrality: 0.10021091790578693,
                                        img: company,
                                    }]
                            })
                        nodex += 400
                        nodey = -(nodey)

                    } else {
                        employeeData[indexdata].org.push({
                            id: data.organization.cin,
                            name: data.organization.name,
                            img: company,

                        })
                    }
                } else {
                    employeeData.push(
                        {
                            members: {
                                id: employee.din,
                                name: employee.name,
                                isClusterNode: true,
                                size: 9.785932721712538,
                                img: empImage,
                                x: (nodex),
                                y: nodey

                            },
                            org: [{
                                id: data.organization.cin,
                                name: data.organization.name,
                                centrality: 0.10021091790578693,
                                degrees: (index * 20) + 90,
                                img: company,
                            }]
                        })
                    nodex += 200
                    nodey = -(nodey)
                }


            })
        })
        employeeData.forEach((data) => {
            nodes.push({
                id: data.members.id,
                name: data.members.name,
                isClusterNode: true,
                img: data.members.img,
                "x": data.members.x,
                "y": data.members.y,
                __indexColor: "red",
            })
            let cordinates = this.circleCoordinates(200, data.org.length, data.members.x, data.members.y);
            data.org.forEach((orgData, index) => {
                links.push({
                    source: data.members.id,
                    target: orgData.id
                })
                if (nodes.findIndex((d) => d.id === orgData.id) === -1) {
                    nodes.push({
                        id: orgData.id,
                        name: orgData.name,
                        centrality: 2.10021091790578693,
                        __indexColor: "red",
                        img: orgData.img,
                        "x": cordinates[0][index],
                        "y": cordinates[1][index],
                    })
                }
            })
        })
        var gData = {
            nodes: nodes,
            links: links
        }
        gData.links.forEach((link) => {
            const a = gData.nodes.find((data) => data.id === link.source);
            const b = gData.nodes.find((data) => data.id === link.target);
            !(a.neighbors) && (a.neighbors = []);
            !(b.neighbors) && (b.neighbors = []);
            a.neighbors.push(b);
            b.neighbors.push(a);

            !a.links && (a.links = []);
            !b.links && (b.links = []);
            a.links.push(link);
            b.links.push(link);
        });
        this.setState({
            nodeData: gData
        }, this.setImage)

    }

    handleNodeClick = (node) => {
        let highlightNodes = this.state.highlightNodes;
        let highlightLinks = this.state.highlightLinks
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
            node.links.forEach(link => highlightLinks.add(link));
        }
        this.setState({
            highlightNodes: highlightNodes,
            highlightLinks: highlightLinks,
            clicked : (!this.state.clicked) ? true: false
        })
    }
    
    circleCoordinates(radius, steps, centerX, centerY) {
        let xCoords = [];
        let yCoords = [];
        for (let i = 0; i < steps; i++) {
            xCoords.push(centerX + radius * Math.cos(2 * Math.PI * (i / steps)));
            yCoords.push(centerY + radius * Math.sin(2 * Math.PI * (i / steps)));
        }
        return [xCoords, yCoords];
    }

    setImage = () => {
        if (!this.state.imageMap) {
            const images = this.state.nodeData.nodes.map(e => ({
                id: e.id,
                image: e.img
            }));
            syncLoadAllImages(images, loadedImages => {
                this.setState({ imageMap: loadedImages });
            })
        }
    }

    nodeCanvasObject = (node, ctx) => {
        const image = this.state.imageMap.get(node.id);
        const image2 = this.state.imageMap.get(node.id);
        if (image) {
                ctx.drawImage(
                     image ,
                    node.x - 24 / 2,
                    node.y - 24 / 2,
                    24,
                    24
                );
        }
        ctx.font = `6px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.name, node.x, node.y + 12);
        ctx.fillStyle = node === this.state.clicked ? 'green' : 'grey';
    }

    render() {
        if (this.state.imageMap) {
            return (
                <>
                    <ForceGraph2D graphData={this.state.nodeData}
                        cooldownTicks={0}
                        maxZoom={10}
                        nodeLabel={(node)=> (node.name)}
                        nodeRelSize={10}
                        linkColor={(link) => (this.state.clicked && this.state.highlightLinks.has(link)  ? "red" : "")}
                        nodeColor={(node) => (this.state.clicked && this.state.highlightNodes.has(node)  ? "green" : "grey")}
                        nodeCanvasObjectMode={node => this.state.highlightNodes.has(node) ? 'after' : 'after'}
                        onNodeClick={this.handleNodeClick}
                        nodeCanvasObject={(node, ctx) =>
                            this.nodeCanvasObject(node, ctx)
                        } />
                </>
            )
        } else {
            return (
                <>
                   <div>Loading...</div> 
                </>
            )
        }

    }
}
export default DisplayNode


export const syncLoadAllImages = (imageQueue, callback) => {
    let numAll = imageQueue.length;
    let numProcessed = 0;
    let allImages = new Map();

    if (numAll === 0) {
        callback(allImages);
        return;
    }

    imageQueue.forEach(e => {
        const image = new Image();
        const id = e.id;
        image.addEventListener("load", () => {
            numProcessed++;
            allImages.set(id, image);
            if (numAll === numProcessed) {
                if (callback) {
                    callback(allImages);
                    return;
                }
            }
        });
        image.src = e.image;
    });
};
