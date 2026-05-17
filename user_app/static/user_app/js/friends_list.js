let currentPage = 1
let isLoading = false

const loaderLine = document.getElementById('friendsLoaderLine')
const friendsList = document.querySelector('.friends-list')

if (loaderLine && friendsList) {
    const currentPath = window.location.pathname

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            isLoading = true
            currentPage++

            try {
                const response = await fetch(
                    `${currentPath}?page=${currentPage}`,
                    {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }
                )

                const data = await response.json()

                if (data.success) {
                    loaderLine.insertAdjacentHTML(
                        'beforebegin',
                        data.html
                    )

                    if (!data.has_next) {
                        observer.disconnect()
                    }
                } else {
                    observer.disconnect()
                }

            } catch (error) {
                console.error(error)
                observer.disconnect()
            }

            isLoading = false
        }
    }, {
        rootMargin: '200px'
    })

    observer.observe(loaderLine)
}