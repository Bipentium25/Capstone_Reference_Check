"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import cytoscape from "cytoscape"
import styles from "./graph.module.css"

export default function ArticleGraphPage() {
    const params = useParams()
    const router = useRouter()
    const articleId = params.id as string
    
    const containerRef = useRef<HTMLDivElement>(null)
    const cyRef = useRef<any>(null)
    
    const [isLoading, setIsLoading] = useState(true)
    const [article, setArticle] = useState<any>(null)
    const [references, setReferences] = useState<any[]>([])
    const [showKeyOnly, setShowKeyOnly] = useState(false)
    const expandedNodesRef = useRef<Set<string>>(new Set())  // Changed to ref

    // Fetch initial article data
    useEffect(() => {
        async function loadData() {
        try {
            const response = await fetch(`https://capstone-reference-check.onrender.com/articles/${articleId}`)
            const articleData = await response.json()
            setArticle(articleData)
            
            const refsResponse = await fetch(`https://capstone-reference-check.onrender.com/references/from/${articleId}`)
            const refsData = await refsResponse.json()
            setReferences(refsData)
            
            setIsLoading(false)
        } catch (error) {
            console.error("Failed to load data:", error)
            setIsLoading(false)
        }
        }
        
        loadData()
    }, [articleId])

    // Initialize Cytoscape ONCE
    useEffect(() => {
        if (!article || isLoading || !containerRef.current || cyRef.current) {
        return
        }

        console.log("Initializing Cytoscape")

        const filteredRefs = showKeyOnly 
        ? references.filter(ref => ref.if_key_reference)
        : references

        cyRef.current = cytoscape({
        container: containerRef.current,
        
        elements: [
        {
            group: 'nodes' as 'nodes',  // ← Add "as 'nodes'"
            data: { 
            id: `article-${article.id}`, 
            label: article.title,
            type: 'main',
            articleId: article.id
            } 
        },
        ...filteredRefs.map(ref => ({
            group: 'nodes' as 'nodes',  // ← Add "as 'nodes'"
            data: {
            id: `article-${ref.cited_to_id}`,
            label: ref.cited_to_title || `Article ${ref.cited_to_id}`,
            type: 'cited',
            articleId: ref.cited_to_id
            }
        })),
        ...filteredRefs.map(ref => ({
            group: 'edges' as 'edges',  // ← Add "as 'edges'"
            data: {
            id: `edge-${ref.id}`,
            source: `article-${article.id}`,
            target: `article-${ref.cited_to_id}`,
            isKey: ref.if_key_reference ? 'yes' : 'no'
            }
        }))
        ],
        style: [
            {
            selector: 'node',
            style: {
                'background-color': '#a5d1ea',
                'label': 'data(label)',
                'text-wrap': 'wrap',
                'text-max-width': '80px',
                'font-size': '6px',
                'width': '15px',
                'height': '15px',
                'color': '#4a5568',
                'text-outline-color': '#fff',
                'text-outline-width': 1
            }
            },
            {
            selector: 'node[type="main"]',
            style: {
                'background-color': '#5f77c0',
                'width': '25px',
                'height': '25px',
                'color': '#2d3748',
                'font-size': '8px',
                'text-outline-color': '#fff',
                'text-outline-width': 1
            }
            },
            {
            selector: 'node[type="cited"]',
            style: {
                'background-color': '#7eb3d6'
            }
            },
            {
            selector: 'edge',
            style: {
                'width': 1.5,
                'line-color': '#cbd5e0',
                'target-arrow-color': '#cbd5e0',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'line-style': 'dashed'
            }
            },
            {
            selector: 'edge[isKey="yes"]',
            style: {
                'line-style': 'solid',
                'width': 2,
                'line-color': '#5f77c0',
                'target-arrow-color': '#5f77c0'
            }
            }
        ],
        
        layout: {
            name: 'cose',
            animate: false  // Disable animation on initial load
        }
        })

        // Add click handler for nodes
        cyRef.current.on('tap', 'node', async (event: any) => {
        const node = event.target
        const nodeId = node.data('id')
        const nodeArticleId = node.data('articleId')
        
        if (expandedNodesRef.current.has(nodeId)) {
            router.push(`/articles/${nodeArticleId}`)
            return
        }

        try {
            const response = await fetch(
            `https://capstone-reference-check.onrender.com/references/from/${nodeArticleId}`
            )
            
            if (!response.ok) {
            console.error("Failed to fetch references")
            return
            }
            
            const nodeRefs = await response.json()
            
            const filteredNodeRefs = showKeyOnly 
            ? nodeRefs.filter((ref: any) => ref.if_key_reference)
            : nodeRefs

            if (filteredNodeRefs.length === 0) {
            expandedNodesRef.current.add(nodeId)
            return
            }

            const newElements: any[] = []
            
            filteredNodeRefs.forEach((ref: any) => {
            const newNodeId = `article-${ref.cited_to_id}`
            
            const existingNode = cyRef.current.getElementById(newNodeId)
            if (existingNode.length === 0) {
                newElements.push({
                group: 'nodes',
                data: {
                    id: newNodeId,
                    label: ref.cited_to_title || `Article ${ref.cited_to_id}`,
                    type: 'cited',
                    articleId: ref.cited_to_id
                }
                })
            }
            
            const edgeId = `edge-${nodeArticleId}-${ref.cited_to_id}`
            const existingEdge = cyRef.current.getElementById(edgeId)
            if (existingEdge.length === 0) {
                newElements.push({
                group: 'edges',
                data: {
                    id: edgeId,
                    source: nodeId,
                    target: newNodeId,
                    isKey: ref.if_key_reference ? 'yes' : 'no'
                }
                })
            }
            })

            if (newElements.length > 0 && cyRef.current) {
            cyRef.current.add(newElements)
            
            cyRef.current.layout({
                name: 'cose',
                animate: true,
                animationDuration: 300,
                fit: false,
                randomize: false,
                stop: function() {
                console.log("Layout complete")
                }
            }).run()
            }

            expandedNodesRef.current.add(nodeId)
            
        } catch (error) {
            console.error("Failed to expand node:", error)
        }
        })

        return () => {
        console.log("Cleaning up Cytoscape")
        if (cyRef.current) {
            cyRef.current.destroy()
            cyRef.current = null
        }
        }
    }, [article, isLoading])  // Removed dependencies that cause recreation

    // Handle filter toggle
    const handleToggleFilter = () => {
        if (!cyRef.current) return
        
        const newShowKeyOnly = !showKeyOnly
        setShowKeyOnly(newShowKeyOnly)
        
        // Filter edges based on new state
        const edges = cyRef.current.edges()
        edges.forEach((edge: any) => {
        const isKey = edge.data('isKey') === 'yes'
        if (newShowKeyOnly && !isKey) {
            edge.style('display', 'none')
        } else {
            edge.style('display', 'element')
        }
        })
    }

    if (isLoading) {
        return (
        <div style={{ padding: '20px' }}>
            <h1>Loading graph...</h1>
        </div>
        )
    }

    if (!article) {
        return (
        <div style={{ padding: '20px' }}>
            <h1>Article not found</h1>
        </div>
        )
    }


    return (
    <div className={styles.container}>
        <div className={styles.header}>
        <h1 className={styles.title}>Citation Graph: {article.title}</h1>
        <div className={styles.buttonGroup}>
            <button
            onClick={handleToggleFilter}
            className={`${styles.filterButton} ${showKeyOnly ? styles.filterButtonActive : ''}`}
            >
            {showKeyOnly ? 'Show All References' : 'Show Key References Only'}
            </button>
            <button onClick={() => router.back()} className={styles.backButton}>
            Back to Article
            </button>
        </div>
        </div>
        
        <p className={styles.hint}>
        💡 Click on any node to expand its citations. Click again to navigate to that article.
        </p>
        
        <div ref={containerRef} className={styles.graphContainer} />
    </div>
    )}