import com.library.User;
import com.library.Role;
import com.library.dao.InMemoryUserDao;
import com.library.dao.UserDao;

public class TestMain {
    public static void main(String[] args) {
        UserDao dao = new InMemoryUserDao();

        User u1 = new User("Rahul", "rahul@gmail.com", "abc123", Role.MEMBER);
        User u2 = new User("Priya", "priya@gmail.com", "xyz789", Role.ADMIN);

        dao.save(u1);
        dao.save(u2);

        System.out.println("u1 id: " + u1.getId());
        System.out.println("u2 id: " + u2.getId());
        System.out.println(dao.findById(1));
        System.out.println(dao.findById(999));
        System.out.println(dao.findByEmail("PRIYA@gmail.com"));
        System.out.println(dao.findByEmail("koi-nahi@x.com"));
    }
}