window.onload=()=>{

//instance of fetch request
// https://dummyjson.com/products
// https://dummyjson.com/products/categories
const url= 'https://dummyjson.com';
let pageLimit=5;
let totalItem=0;
let currentPage=1;
let nextPage=0;
let totalPage=0;
let skip=0;
let previousPage=0;
// page=nextPage;
let startPage=1;
let endPage=5;
let totalCategory=25;
//shimmer: take a element as argument and apply shimmer effect in that element.
const categoryShimmer=(element,numberOfShimmerElemnt)=>{
    const shimmerStr=`<h2 class="shimmerBG content-line"></h2>`
    let result=''
    for(let i=0;i<numberOfShimmerElemnt;i++){
        result+=shimmerStr
    }
    element.innerHTML= result
}
const productShimmer=(element,numberOfShimmerElemnt)=>{
    const shimmerString=`
    <div class="shimmerBG media"></div>
        <div class="article-description">
        <h2 class="shimmerBG title-line"></h2>
        <h2 class="shimmerBG title-line end"></h2>
        <h4 class="shimmerBG content-line"></h4>
        <h5 class="shimmerBG content-line"></h5>
        <h4 class="shimmerBG content-line"></h4>
        <h5 class="shimmerBG content-line end"></h5>
    </div>`
    let result=''
    
    for(let i=0;i<numberOfShimmerElemnt;i++){
        result+=shimmerString;
    }
    element.innerHTML=result;
    
}

//callback function. when page event happend then this function will call.
const pageChange=(event)=>{
    window.scrollTo(0, 100);
    categoryShimmer(document.getElementById('product'));
    nextPage=parseInt(event.target.getAttribute('data-clickedPage'));
    skip=pageLimit*nextPage-pageLimit;
    previousPage=currentPage;
    currentPage=nextPage;
    let excess=0;
    // console.log("page gap:",nextPage,previousPage);
    if(nextPage-2>=1 && nextPage+2<=totalPage){
        startPage=nextPage-2;
        endPage=nextPage+2;
    }else{
        if(nextPage-2<1){
            startPage=1;
            endPage=pageLimit>totalPage?totalPage:pageLimit;
        }
        if(nextPage+2>totalPage){
            endPage=totalPage;
            startPage=(totalPage-pageLimit)>0?endPage-pageLimit+1:1
        }
        // startPage=1;
    }
    
    getData(url,{
        path: "products",
        query: {
            limit: pageLimit,
            skip: skip,
        },
        preLoader: ()=> productShimmer(document.getElementById("product"),pageLimit),
        postLoader: ()=> document.getElementById("product").innerHTML='',
        callBack: setProduct,
    });
}


//it takes object and return query string.
function queryBuilder(obj={}){
    if(Object.keys(obj).length === 0){
        return '';
    }
    return Object.keys(obj).map(key=> `${key}=${obj[key]}`).join('&')
}
//it takes url and an object which contain(path,query object,callback,preLoader,postloader) and call the callBack function with json data.
function getData(url,{path='',query='',callBack,preLoader=undefined,postLoader=undefined}){
    if(preLoader){
        preLoader();
    }
    fetch(`${url}${path?'/'+path: ''}${query?'?'+queryBuilder(query):''}`)
    .then((res)=>res.json())
    .then((data)=>{
        if(postLoader){
            postLoader()
        }
        callBack(data)   
    })
    .catch((err)=> {
        if(postLoader){
            postLoader()
        } 
        // console.log(err)
    });
}
//it takes data and set categories to category block
const setCategories=(data)=>{
    totalCategory=Object.keys(data).length;
    // console.log(data);
    document.getElementById("category").innerHTML= Object.keys(data).map((idx)=>{
        // let str="";
        // str = data[idx];
        // console.log(str)
        return `<li>
                    <h4>${data[idx]}</h4>
                    <div ><i class="circle-border fa-solid fa-angle-down"></i></div>
                </li>`
    }).join('')
}

//it takes data and set product to product block
const setProduct=(data)=>{
    totalItem=parseInt(data.total);
    totalPage=Math.ceil(totalItem/pageLimit);    
    setPagination(totalItem)
    const products=data.products;
    document.getElementById("product").innerHTML='';
    document.getElementById("product").innerHTML= Object.keys(products).map((idx)=>{
        const {thumbnail='',title='',description='', category=''} = products[idx];
        return `
        <div><img src="${thumbnail}" alt="${category}"></div>
        <div class="article-description">
            <h2>${title}</h2>
            <h3 style="padding: 0.5rem 0rem;"><span>${category}</span></h3>
            <h5>${description}</h5>
        </div>
        `
    }).join('')
}

const setPagination=(totalItem)=>{
    let pagination =document.getElementById("paginate");
    document.getElementById("paginate").innerHTML='';
    // console.log(startPage,endPage);

    //previous page button
    let previousPageElement = document.createElement('button');
    previousPageElement.innerHTML="&lt&ltprevious"
    previousPageElement.classList.add('page')
    if(currentPage===1){
        previousPageElement.classList.add('page-disable')
        previousPageElement.setAttribute('disabled','')   
    }else{
        previousPageElement.setAttribute('data-clickedPage',currentPage-1)
    }
    previousPageElement.addEventListener('click',pageChange);
    pagination.appendChild(previousPageElement);

    //loop to create dynamic page element
    for(let i=startPage;i<=endPage;i++){
        let div=document.createElement('div');
        div.classList.add('page');
        if(currentPage===i){
            div.classList.add('page-active');
        }
        div.setAttribute("data-clickedPage",i);
        div.innerText=i;
        div.addEventListener('click',pageChange);
        pagination.appendChild(div);
    }

    //next page button
    let nextPageElement = document.createElement('button');
    nextPageElement.innerHTML="next&gt&gt"
    nextPageElement.classList.add('page')
    // currentPage===totalPage?nextPageElement.classList.add('page-disable'): nextPageElement.setAttribute('data-clickedPage',currentPage+1)
    if(currentPage===totalPage){
        nextPageElement.classList.add('page-disable')
        nextPageElement.setAttribute('disabled','')   
    }else{
        nextPageElement.setAttribute('data-clickedPage',currentPage+1)
    }
    nextPageElement.addEventListener('click',pageChange);
    pagination.appendChild(nextPageElement);


}

getData(url,{
    path: "products/categories",
    preLoader: ()=> categoryShimmer(document.getElementById("category"),totalCategory),
    callBack: setCategories,
});

getData(url,{
    path: "products",
    query: {
        limit: pageLimit,
        skip: skip,
    },
    preLoader: ()=> productShimmer(document.getElementById("product"),pageLimit),
    postLoader: ()=> document.getElementById("product").innerHTML='',
    callBack: setProduct,
});
}