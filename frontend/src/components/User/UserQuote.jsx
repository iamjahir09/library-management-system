
import { useLocation } from "react-router-dom";

const pageQuotes = {
    "/user": {
        label: "A NOTE FROM THE LIBRARY",
        quote: "A room without books is like a body without a soul.",
        author: "Marcus Tullius Cicero",
    },

    "/user/catalogue": {
        label: "EXPLORE THE COLLECTION",
        quote: "A reader lives a thousand lives before he dies.",
        author: "George R. R. Martin",

    },

    "/user/my-books": {
        label: "YOUR READING JOURNEY",
        quote: "There is no friend as loyal as a book.",
        author: "Ernest Hemingway",
    },

    "/user/profile": {
        label: "YOUR PERSONAL LIBRARY",
        quote: "The more that you read, the more things you will know.",
        author: "Dr. Seuss",
    },
};

function UserQuote() {
    const location = useLocation();

    const quote =
        pageQuotes[location.pathname] ||
        pageQuotes["/user"];

    return (
        <section className="user-quote">
            <p className="user-quote-label">
                {quote.label}
            </p>

            <blockquote className="user-quote-text">
                “{quote.quote}”
            </blockquote>

            <p className="user-quote-author">
                — {quote.author}
            </p>
        </section>
    );
}

export default UserQuote;
