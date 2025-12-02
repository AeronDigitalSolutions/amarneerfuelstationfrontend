import '../../style/About/Team.css'
import image1 from '../../assets/Team-01.png'
import Team2 from '../../assets/Teams-02.png'
import Team3 from '../../assets/Teams-03.png'
import team4 from '../../assets/Teams-04.png'
import team5 from '../../assets/Teams-05.png'
import team6 from '../../assets/Teams-06.png'
import team7 from '../../assets/Teams-07.png'
import team8 from '../../assets/Teams-09.png'
const Team = () => {
  return (
    <section className="team_section">

      <p className="team_subtitle">OUR TEAM</p>
      <h1 className="team_title">MEET OUR TEAM</h1>

      <div className="team_grid">

        
        <div className="team_card">
          <div className="img_box">
            <img src={image1} alt="" />
          </div>
          <div className="team_info">
            <h3>Michael Ramirez</h3>
            <p>CEO Aeron Digital Solutions</p>
          </div>
        </div>

       
        <div className="team_card">
          <div className="img_box">
            <img src={Team2} alt="" />
          </div>
          <div className="team_info">
            <h3>William</h3>
            <p>Chief Executive Officer</p>
          </div>
        </div>

        
        <div className="team_card">
          <div className="img_box">
            <img src={Team3} alt="" />
          </div>
          <div className="team_info">
            <h3>Robert</h3>
            <p>VP of Operations</p>
          </div>
        </div>

      
        <div className="team_card">
          <div className="img_box">
            <img src={team4} alt="" />
          </div>
          <div className="team_info">
            <h3>Robert</h3>
            <p>VP of Operations</p>
          </div>
        </div>
  

       
        <div className="team_card">
          <div className="img_box">
            <img src={team5} alt="" />
          </div>
          <div className="team_info">
            <h3>Robert Hughes</h3>
            <p>CEO creavision</p>
          </div>
        </div>

       
        <div className="team_card">
          <div className="img_box">
            <img src={team6} alt="" />
          </div>
          <div className="team_info">
            <h3>Marina</h3>
            <p>Chief Executive Officer</p>
          </div>
        </div>

        
        <div className="team_card">
          <div className="img_box">
            <img src={team7} alt="" />
          </div>
          <div className="team_info">
            <h3>Dmitry</h3>
            <p>Chief Technology</p>
          </div>
        </div>

       
        <div className="team_card">
          <div className="img_box">
            <img src={team8} alt="" />
          </div>
          <div className="team_info">
            <h3>Olivia Adams</h3>
            <p>VP of Operations</p>
          </div>
        </div>

      
      </div>
    </section>
  );
};

export default Team;
