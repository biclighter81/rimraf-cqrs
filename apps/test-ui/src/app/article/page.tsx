'use client';

import { createUseReadModel } from "@/UseReadModel";
import { article, manufacturer } from "@/commands";
import { Dialog } from '@/components/ui'
import { useMemo, useState } from "react";
import { ArticleOverview, articleOverviewReducer } from "read-reducer";

const imgS = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>`
//<img height={64} width={64} src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ><circle cx="50" cy="50" r="50" /></svg>' alt="" />

const useReadModel = createUseReadModel("http://localhost:4001/");
export default function Article() {
    const articleOverview = useReadModel("articleOverview", [{ aggName: "Article", aggReducer: articleOverviewReducer }]);

    const [state, setState] = useState<{
        buildDlg?: { name: string, errMsg?: string }
        readForsaleDlg?: { articleId?: string, price: string, errMsg?: string },
        priceChange?: { articleId?: string, price: string, errMsg?: string }
    }>({});

    const build = () => {
        if (state.buildDlg?.name !== undefined && state.buildDlg?.name.length > 3) {

            article.buildArticle({ name: state.buildDlg?.name }).then(() => {
                setState({ ...state, buildDlg: undefined })
            }).catch(err => {
                setState({ ...state, buildDlg: { ...state.buildDlg, name: state.buildDlg?.name || "", errMsg: err } })
            })
        }
    }

    const readyForSale = () => {
        if (state.readForsaleDlg?.articleId !== undefined && (+state.readForsaleDlg?.price).toString() == state.readForsaleDlg?.price) {
            article.articleReadyForSale({ articleId: state.readForsaleDlg?.articleId, price: Number(state.readForsaleDlg?.price) })
                .then(() => setState({ ...state, readForsaleDlg: undefined }))
                .catch(err => setState({ ...state, readForsaleDlg: { ...state.readForsaleDlg, price: state.readForsaleDlg?.price || "", errMsg: err } }))
        }
    }

    const priceChange = () => {
        if (state.priceChange?.articleId !== undefined && (+state.priceChange?.price).toString() == state.priceChange?.price) {
            article.articleReadyForSale({ articleId: state.priceChange?.articleId, price: Number(state.priceChange?.price) })
                .then(() => setState({ ...state, priceChange: undefined }))
                .catch(err => setState({ ...state, priceChange: { ...state.priceChange, price: state.priceChange?.price || "", errMsg: err } }))
        }
    }

    const nameChange = async (id: string) => {
        const res = await article.changeArticleName({
            id,
            name: nameInput
        })
        console.log(res)
    }

    const saveManufacurer = async() => {
        const res = await manufacturer.createManufactor(nameManufacInput)
        console.log(res)
    }
    const assignManufacturer = async(articleId: string) => {
        const res = await article.assignManufacturer(articleId,"931a1517-8292-47fd-8e3e-09d3e99dd752");
        console.log(res)
    }

    // const manufacurer = 

    const [nameInput, setNameInput] = useState("");
    const [nameManufacInput, setNameManufacInput] = useState("")

    return (<>
        <div>
            <button onClick={() => setState({ ...state, buildDlg: { name: "" } })} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Build Article
            </button>
        </div>

        <div>
            Hersteller: <input type="text" onChange={(e) => setNameManufacInput(e.target.value)} />
            <button onClick={(e) => saveManufacurer()}>Add Hersteller</button>
        </div>



        <Dialog show={!!state.buildDlg}
            description="Build Article"
            onClose={() => setState({ ...state, buildDlg: undefined })}
            onSave={() => build()}
        >
            <div>
                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                <input onChange={(e) => { setState({ ...state, buildDlg: { ...state.buildDlg, name: e.target.value } }) }} type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="no mbe,sty allowed" required />
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{state.buildDlg?.errMsg}</p>
            </div>
        </Dialog>

        <Dialog show={!!state.readForsaleDlg}
            description="Ready For Sale"
            onClose={() => setState({ ...state, readForsaleDlg: undefined })}
            onSave={() => { readyForSale() }}
        >
            <div>
                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
                <input type="number" value={state.readForsaleDlg?.price.toString()} onChange={(e) => { setState({ ...state, readForsaleDlg: { ...state.readForsaleDlg, price: e.target.value } }) }} id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{state.readForsaleDlg?.errMsg}</p>
            </div>
        </Dialog>

        <Dialog show={!!state.priceChange}
            description="priceChange"
            onClose={() => setState({ ...state, priceChange: undefined })}
            onSave={() => { priceChange() }}
        >
            <div>
                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
                <input type="number" value={state.priceChange?.price.toString()} onChange={(e) => { setState({ ...state, priceChange: { ...state.priceChange, price: e.target.value } }) }} id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{state.priceChange?.errMsg}</p>
            </div>
        </Dialog>

        <div className="flex flex-wrap">

            {articleOverview === undefined ?
                <div className="flex items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">loading...</div>
                </div>
                : articleOverview.map(article => {
                    return (
                        <div key={article.articleId} className="max-w-sm p-6 m-1 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            
                            <img className="rounded-t-lg" height={64} width={64} src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ><circle cx="50" cy="50" r="50" /></svg>' alt="" />

                            <div className="p-5">
                                <h2>Hersteller {article.manufacturerName}</h2>
                                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{article.Name}</h5>
                                {!article.InSale ? <div className="bg-orange-300 text-center">Article not active</div> : ""}
                                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{article.Price} €</p>
                                {!article.InSale ? <button onClick={() => {
                                    setState({
                                        ...state, readForsaleDlg: {
                                            ...state.readForsaleDlg,
                                            articleId: article.articleId,
                                            price: article.Price.toString()
                                        }
                                    })
                                }} data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Ready For Sale
                                </button>
                                    :
                                    <button onClick={() => {
                                        setState({
                                            ...state, priceChange: {
                                                ...state.readForsaleDlg,
                                                articleId: article.articleId,
                                                price: article.Price.toString()
                                            }
                                        })
                                    }} data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Change Price
                                    </button>}

                            </div>
                            <div className="mt-8">
                                <input placeholder="change name" value={nameInput} onChange={(e) => setNameInput(e.target.value)}></input>
                                <button onClick={() => nameChange(article.articleId)}>Name ändern</button>
                                <button onClick={() => assignManufacturer(article.articleId)}>Assign</button>
                            </div>

                        </div>
                    )
                })}
        </div>
    </>)
}

const buildDlg = () => {
    return (<>
    </>)
}