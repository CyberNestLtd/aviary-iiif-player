import React, { useState, useEffect, useRef } from "react";

const Search = ({ tokens, setTokens, annotation }) => {
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(true);
    let highlightCounter = useRef({});
    const [hits, setHits] = useState({});

    const handleChange = (e) => { setQuery(e.target.value) }

    useEffect(() => {
        if (annotation == null) return;
        console.log(annotation, tokens);
        annotation.transcript.map((point) => {
            let ele = document.createElement('div');
            ele.innerHTML = point.text;
            ele.innerHTML = ele.innerHTML.replace(/<\/?mark[^>]*>/g, "");
            if (tokens.length > 0) highlight(ele, tokens);
            point.text = ele.innerHTML
        });
        setHits({ ...highlightCounter.current });
        highlightCounter.current = {};
        setTokens([...tokens]);
    }, [annotation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query == "" || query == null) return;
        if (typeof tokens.find(ele => { return ele.toLowerCase() === query.toLowerCase(); }) != "undefined") return; 
        let newTokens = [...tokens, query];
        setTokens([...newTokens]);
        setQuery("");
        setShowResults(true);
        annotation.transcript.map((point, index) => {
            let ele = document.createElement('div');
            ele.innerHTML = point.text;
            highlight(ele, [query]);
            point.text = ele.innerHTML
        });
        setHits({ ...hits, ...highlightCounter.current });
        highlightCounter.current = {};
    }

    const handleDelete = (e) => {
        e.preventDefault();
        let index = e.currentTarget.getAttribute('index')
        let copy = [...tokens]
        let key = copy.splice(index, 1);
        setTokens([...copy]);
        //TODO: need to delete only 1 token then no need to highlight again
        setHits({});
        annotation.transcript.map((point) => {
            let ele = document.createElement('div');
            ele.innerHTML = point.text;
            ele.innerHTML = ele.innerHTML.replace(/<\/?mark[^>]*>/g, "");
            if (copy.length > 0 && copy[0] != "") highlight(ele, copy);
            point.text = ele.innerHTML
        });
        setHits({ ...highlightCounter.current });
        highlightCounter.current = {};
        // setAnnotation(annotation);
    }

    const toggleResults = () => setShowResults((showResults == true) ? false : true);
    const resetTokens = () => {
        setTokens([]);
        // domTrascripts.innerHTML = domTrascripts.innerHTML.replace(/<\/?mark[^>]*>/g, "");
        annotation.transcript.map((point) => {
            let ele = document.createElement('div');
            ele.innerHTML = point.text;
            ele.innerHTML = ele.innerHTML.replace(/<\/?mark[^>]*>/g, "");
            point.text = ele.innerHTML
        });
        setHits({});
        // setAnnotation(annotation);
    }

    const prevIndex = (e) => {
        let index = e.currentTarget.getAttribute('index');
        let counter = { ...hits };
        if (counter[index].active > 0) {
            counter[index].active -= 1;
            // let span = e.currentTarget.parentElement.getElementsByTagName('span');
            // span.textContent = counter[index].active + "/" + counter[index].total
            navActiveMarker(index, counter[index].active);
            setHits({ ...counter });
        }
        // console.log('prev', counter.current)
    }

    const nextIndex = (e) => {
        console.log('next')
        let index = e.currentTarget.getAttribute('index');
        let counter = { ...hits };
        if (counter[index].active < counter[index].total) {
            // let span = e.currentTarget.parentNode.getElementsByTagName('span');
            counter[index].active = counter[index].active + 1;
            navActiveMarker(index, counter[index].active);
            setHits({ ...counter });
        }
    }

    const navActiveMarker = (token, index) => {
        let parent = document.getElementById("transcript_data");
        var active_nodes = parent.querySelectorAll(".active-marker");
        setTimeout(function () {
            //remove previous active
            active_nodes.forEach((mark) => {
                if (mark.textContent.toLowerCase() === token) {
                    mark.classList.remove("active-marker");
                    return;
                }
            });
            var nodes = parent.querySelectorAll("[data-mark_index='" + index + "']");
            nodes.forEach((mark) => {
                if (mark.textContent.toLowerCase() === token) {
                    //set active + scroll
                    mark.classList.add("active-marker");
                    let parentTopOffset = parent.offsetTop;
                    parent.scrollTo({
                        top: mark.offsetTop - parentTopOffset,
                        behavior: 'smooth'
                    });
                    return;
                }
            })
        }, 0)
    }

    const highlight = (elem, keywords, caseSensitive = false, cls = 'highlight-marker') => {
        if (!elem) return null;
        const flags = caseSensitive ? 'g' : 'gi';
        // Sort longer matches first to avoid
        // highlighting keywords within keywords.
        keywords.sort((a, b) => b.length - a.length);
        Array.from(elem.childNodes).forEach(child => {
            const keywordRegex = RegExp(keywords.join('|'), flags);
            if (child.nodeType !== 3) { // not a text node
                highlight(child, keywords, caseSensitive, cls);
            } else if (keywordRegex.test(child.textContent)) {
                const frag = document.createDocumentFragment();
                let lastIdx = 0;
                child.textContent.replace(keywordRegex, (match, idx) => {
                    if (highlightCounter.current.hasOwnProperty(match.toLowerCase())) {
                        highlightCounter.current[match.toLowerCase()]['total'] += 1
                    } else {
                        highlightCounter.current[match.toLowerCase()] = { total: 1, active: 0 }
                    }
                    const part = document.createTextNode(child.textContent.slice(lastIdx, idx));
                    const highlighted = document.createElement('mark');
                    highlighted.textContent = match;
                    highlighted.classList.add(cls);
                    highlighted.dataset.mark_index = highlightCounter.current[match.toLowerCase()]['total'];
                    frag.appendChild(part);
                    frag.appendChild(highlighted);
                    lastIdx = idx + match.length;
                });
                const end = document.createTextNode(child.textContent.slice(lastIdx));
                frag.appendChild(end);
                child.parentNode.replaceChild(frag, child);
            }
        });
    }

    React.useEffect(() => {
        // Clean up state on component unmount
        return () => {
            setQuery("");
            setShowResults(true);
            highlightCounter = {};
            setHits({});
        };
    }, []);

    return (
        <div id="transcript_search_box">
            <form onSubmit={handleSubmit}>
                <input value={query} type="text" onChange={handleChange} placeholder="Search this Resource" className="px-4 pt-4 pb-3 border w-full rounded-md" />
            </form>
            {(tokens.length > 0) ? (
                <div id="searched_keywords">
                    <div>
                        <label onClick={toggleResults}>
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            Results
                        </label>
                        <button onClick={resetTokens} className="float-right">Clear all search terms</button>
                    </div>
                    <ul className={showResults ? 'visible' : 'hidden'}>
                        <>
                            {
                                tokens.map((q, index) => {
                                    let hit = hits.hasOwnProperty(q.toLowerCase()) ? hits[q.toLowerCase()] : { total: 0, active: 0 }
                                    return <li key={index}>
                                        <div>{q} 
                                        <button onClick={prevIndex} index={q.toLowerCase()}>{' < '}</button> 
                                        <span>{hit.active}/{hit.total}</span>
                                        <button onClick={nextIndex} index={q.toLowerCase()}>{' > '}</button>
                                        </div> 
                                        <button onClick={handleDelete} index={index}>x</button>
                                        </li>;
                                })
                                // Object.keys(hits).map((key, index) => {
                                //     let hit = hits[key];
                                //     return <li key={index}>
                                //         <div>{tokens.find(ele => { return ele.toLowerCase() === key; })}
                                //             <button onClick={prevIndex} index={hit.match.toLowerCase()}>{' < '}</button>
                                //             <span>{hit.active}/{hit.total}</span>
                                //             <button onClick={nextIndex} index={hit.match.toLowerCase()}>{' > '}</button>
                                //         </div>
                                //         <button onClick={handleDelete} index={index}>x</button>
                                //     </li>;
                                // })
                            }
                        </>
                    </ul>
                </div>
            ) : null}

        </div>
    );

}

export default Search;