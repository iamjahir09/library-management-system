
import { useState } from "react";
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    ShieldCheck,
    Pencil,
    Save,
    RotateCcw
} from "lucide-react";
import "./MyProfile.css";
function formatMemberSince(date) {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}
function MyProfile() {
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const loggedInUser = JSON.parse(
        sessionStorage.getItem("user") || "{}"
    );
    const [profile, setProfile] = useState({
        name: loggedInUser.name || loggedInUser.fullName || "",
        email: loggedInUser.email || "",
        mobile: loggedInUser.mobile_number || "",
        address: loggedInUser.address || "",
        memberSince: loggedInUser.created_at || "",
        role: loggedInUser.role
    });

    function handleChange(event) {
        const { name, value } = event.target;

        setProfile(previous => ({
            ...previous,
            [name]: value
        }));

        setSaved(false);
    }

    function handleSave(event) {
        event.preventDefault();
        setEditing(false);
        setSaved(true);
    }

    function handleCancel() {
        setEditing(false);
        setSaved(false);
    }

    return (
        <div className="my-profile-page">
            <div className="my-profile-heading">
                <div>
                    <span className="my-profile-eyebrow">
                        THE OLD LIBRARY / MEMBER
                    </span>
                    <h1>My Profile</h1>
                    <p>View and manage your library account information.</p>
                </div>

                <div className="my-profile-heading-icon">
                    <UserRound size={27} />
                </div>
            </div>

            <section className="my-profile-banner">
                <div className="my-profile-banner-icon">
                    <UserRound size={35} />
                </div>

                <div className="my-profile-banner-info">
                    <span className="my-profile-member-label">
                        LIBRARY MEMBER
                    </span>
                    <h2>{profile.name || "Library Member"}</h2>
                    <p>{profile.email}</p>
                </div>

                <span className="my-profile-role">
                    <ShieldCheck size={15} />
                    {profile.role}
                </span>
            </section>

            <div className="my-profile-content-grid">
                <section className="my-profile-card my-profile-about">
                    <div className="my-profile-card-heading">
                        <div>
                            <h2>Membership Details</h2>
                            <p>Your library account at a glance.</p>
                        </div>
                    </div>

                    <div className="my-profile-detail">
                        <span className="my-profile-detail-icon">
                            <Mail size={18} />
                        </span>
                        <div>
                            <span>Email Address</span>
                            <strong>{profile.email || "Not provided"}</strong>
                        </div>
                    </div>

                    <div className="my-profile-detail">
                        <span className="my-profile-detail-icon">
                            <CalendarDays size={18} />
                        </span>
                        <div>
                            <span>Member Since</span>
                            <strong>{formatMemberSince(profile.memberSince)}</strong>
                        </div>
                    </div>

                    <div className="my-profile-detail">
                        <span className="my-profile-detail-icon">
                            <ShieldCheck size={18} />
                        </span>
                        <div>
                            <span>Account Type</span>
                            <strong>{profile.role}</strong>
                        </div>
                    </div>

                    <div className="my-profile-about-note">
                        <BookOpenIcon />
                        <p>
                            Your library account helps you keep track of your
                            reading and borrowing history.
                        </p>
                    </div>
                </section>

                <section className="my-profile-card my-profile-edit-card">
                    <div className="my-profile-card-heading my-profile-edit-heading">
                        <div>
                            <h2>Personal Information</h2>
                            <p>Keep your contact details up to date.</p>
                        </div>

                        {!editing && (
                            <button
                                className="my-profile-edit-button"
                                onClick={() => {
                                    setEditing(true);
                                    setSaved(false);
                                }}
                            >
                                <Pencil size={15} />
                                Edit
                            </button>
                        )}
                    </div>

                    {saved && (
                        <div className="my-profile-success" role="status">
                            Your changes are saved in this session.
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        <div className="my-profile-form-field">
                            <label htmlFor="profile-name">Full Name</label>
                            <div className="my-profile-input-wrap">
                                <UserRound size={17} />
                                <input
                                    id="profile-name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    required
                                    maxLength={100}
                                />
                            </div>
                        </div>

                        <div className="my-profile-form-field">
                            <label htmlFor="profile-email">Email Address</label>
                            <div className="my-profile-input-wrap">
                                <Mail size={17} />
                                <input
                                    id="profile-email"
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    readOnly
                                />
                            </div>
                            <span className="my-profile-field-hint">
                                Email editing is not enabled in this demo.
                            </span>
                        </div>

                        <div className="my-profile-form-field">
                            <label htmlFor="profile-mobile">Mobile Number</label>
                            <div className="my-profile-input-wrap">
                                <Phone size={17} />
                                <input
                                    id="profile-mobile"
                                    type="tel"
                                    name="mobile"
                                    value={profile.mobile}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Enter mobile number"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    title="Enter a 10-digit mobile number"
                                />
                            </div>
                        </div>

                        <div className="my-profile-form-field">
                            <label htmlFor="profile-address">Address</label>
                            <div className="my-profile-input-wrap my-profile-address-wrap">
                                <MapPin size={17} />
                                <textarea
                                    id="profile-address"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Enter your address"
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        {editing && (
                            <div className="my-profile-form-actions">
                                <button
                                    type="button"
                                    className="my-profile-cancel-button"
                                    onClick={handleCancel}
                                >
                                    <RotateCcw size={15} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="my-profile-save-button"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </section>
            </div>
        </div>
    );
}

function BookOpenIcon() {
    return <span className="my-profile-note-symbol">✦</span>;
}

export default MyProfile;
